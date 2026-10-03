package ai.taverncode.client.onboarding

/** A currently-detected onboarding need, as published by [ai.taverncode.client.onboarding.TavernOnboardingService]. */
data class OnboardingStep(
    val id: String,
    val need: OnboardingNeed,
    val blocking: Boolean,
)
