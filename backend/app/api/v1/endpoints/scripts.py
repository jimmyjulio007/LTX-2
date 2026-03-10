from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel
from ....dependencies import get_session, get_current_user
from ....models import (
    VideoJob, JobType, Project, ProjectClip, User,
)
from ....core.script_parser import script_parser
from ....core.tasks import process_gpu_job
from typing import Optional

router = APIRouter()


class ScriptInput(SQLModel):
    text: str
    locale: str = "en"


class BatchGenerateInput(SQLModel):
    scenes: list[dict]
    project_name: str = "Script Project"


@router.post("/parse")
async def parse_script(
    data: ScriptInput,
    user: User = Depends(get_current_user),
):
    """Parse a script into scene breakdown."""
    scenes = await script_parser.parse_script(data.text, data.locale)
    return {"scenes": scenes, "total_scenes": len(scenes)}


@router.post("/generate-storyboard")
async def generate_storyboard(
    data: ScriptInput,
    user: User = Depends(get_current_user),
):
    """Generate visual prompts from a script."""
    scenes = await script_parser.parse_script(data.text, data.locale)
    storyboard = []
    for scene in scenes:
        storyboard.append({
            **scene,
            "prompt": scene.get("prompt_suggestion", scene.get("description", "")),
            "negative_prompt": "low quality, blurry, distorted, text overlay",
        })
    return {"storyboard": storyboard}


@router.post("/batch-generate")
async def batch_generate(
    data: BatchGenerateInput,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Generate all scenes at once, creating a Project with VideoJobs."""
    total_cost = len(data.scenes)
    if user.credits < total_cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Need {total_cost}, have {user.credits}",
        )

    # Create project
    project = Project(name=data.project_name, user_id=user.id)
    session.add(project)
    session.commit()
    session.refresh(project)

    jobs = []
    for i, scene in enumerate(data.scenes):
        prompt = scene.get("prompt", scene.get("prompt_suggestion", scene.get("description", "")))
        job = VideoJob(
            prompt=prompt,
            negative_prompt=scene.get("negative_prompt", "low quality, blurry, distorted"),
            job_type=JobType.TEXT_TO_VIDEO,
            user_id=user.id,
            cost=1,
        )
        session.add(job)
        session.commit()
        session.refresh(job)

        # Add clip to project
        clip = ProjectClip(
            project_id=project.id,
            job_id=job.id,
            position=i,
        )
        session.add(clip)

        # Dispatch to Celery
        task = process_gpu_job.delay(job.id)
        job.celery_task_id = task.id
        session.add(job)

        jobs.append({"job_id": job.id, "scene_number": i + 1, "prompt": prompt})

    session.commit()

    return {
        "project_id": project.id,
        "total_scenes": len(jobs),
        "credits_charged": total_cost,
        "jobs": jobs,
    }
