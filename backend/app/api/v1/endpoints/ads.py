from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlmodel import Session, select
from ....dependencies import get_session, get_current_user, check_credits
from ....models import (
    User, AdCampaign, AdCampaignCreate, AdCampaignResponse,
    AdPerformance, AdPerformanceResponse,
    VideoJob, JobStatus, JobType,
)
from ....core.ai_prompter import ai_prompter
from ....core.product_scraper import product_scraper
from ....core.runpod import trigger_runpod_job
import uuid

router = APIRouter()


@router.post("/campaigns", response_model=AdCampaignResponse)
async def create_ad_campaign(
    campaign_in: AdCampaignCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    num_variations = campaign_in.num_variations or 3

    if user.credits < num_variations:
        raise HTTPException(status_code=402, detail="Insufficient credits for this campaign.")

    # Scrape product data if URL provided
    product_data = None
    product_images = None
    if campaign_in.product_url:
        product_data = await product_scraper.scrape_product(campaign_in.product_url)
        if product_data.get("images"):
            import json
            product_images = json.dumps(product_data["images"])

    campaign = AdCampaign(
        name=f"Campaign {campaign_in.target_platform.upper()} - {uuid.uuid4().hex[:6]}",
        product_description=campaign_in.product_description,
        product_url=campaign_in.product_url,
        target_platform=campaign_in.target_platform,
        product_images=product_images,
        total_variations=num_variations,
        user_id=user.id,
        status="GENERATING",
    )
    session.add(campaign)
    session.commit()
    session.refresh(campaign)

    # Generate Scripts via AI (with scraped product context)
    scripts = await ai_prompter.generate_ad_scripts(
        campaign_in.product_description,
        campaign_in.target_platform,
        num_variations,
        product_data=product_data,
    )

    for script in scripts:
        job = VideoJob(
            prompt=script["prompt"],
            negative_prompt=script["negative_prompt"],
            width=script["width"],
            height=script["height"],
            job_type=JobType.TEXT_TO_VIDEO,
            user_id=user.id,
            campaign_id=campaign.id,
            cost=1,
        )
        session.add(job)
        session.commit()
        session.refresh(job)

        background_tasks.add_task(trigger_runpod_job, job, session, user)

    session.refresh(campaign)
    return campaign


@router.get("/campaigns", response_model=list[AdCampaignResponse])
async def list_campaigns(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    statement = select(AdCampaign).where(AdCampaign.user_id == user.id)
    return session.exec(statement).all()


@router.get("/campaigns/{campaign_id}/performance", response_model=list[AdPerformanceResponse])
async def get_campaign_performance(
    campaign_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Get performance metrics for a campaign."""
    campaign = session.get(AdCampaign, campaign_id)
    if not campaign or campaign.user_id != user.id:
        raise HTTPException(status_code=404, detail="Campaign not found")

    stmt = select(AdPerformance).where(AdPerformance.campaign_id == campaign_id)
    return session.exec(stmt).all()


@router.patch("/campaigns/{campaign_id}/optimize")
async def optimize_campaign(
    campaign_id: str,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    """Pause low-CTR variations and identify best performer."""
    campaign = session.get(AdCampaign, campaign_id)
    if not campaign or campaign.user_id != user.id:
        raise HTTPException(status_code=404, detail="Campaign not found")

    stmt = select(AdPerformance).where(AdPerformance.campaign_id == campaign_id)
    performances = session.exec(stmt).all()

    if not performances:
        return {"message": "No performance data yet", "paused": 0}

    # Find best and pause underperformers
    avg_ctr = sum(p.ctr for p in performances) / len(performances) if performances else 0
    best = max(performances, key=lambda p: p.ctr)
    paused_count = 0

    for perf in performances:
        if perf.ctr < avg_ctr * 0.5 and perf.id != best.id:
            perf.is_active = False
            session.add(perf)
            paused_count += 1

    campaign.best_variation_id = best.job_id
    session.add(campaign)
    session.commit()

    return {
        "best_variation_id": best.job_id,
        "best_ctr": best.ctr,
        "paused": paused_count,
        "avg_ctr": avg_ctr,
    }
