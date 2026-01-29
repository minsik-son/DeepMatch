import { getTextSimilarity } from '../utils/textSimilarity';
import { getImageHash, getImageSimilarity } from '../utils/imageSimilarity';
import { getCachedImageHash } from '../utils/cache';

export interface ScoringInput {
    amazonTitle: string;
    amazonImageUrl: string;
    aliTitle: string;
    aliImageUrl: string;
}

export interface ScoringResult {
    finalScore: number;  // 0~100
    textSim: number;     // 0~1
    imageSim: number;    // 0~1
    decision: 'fast-pass' | 'ai-verify' | 'reject';
}

/**
 * Calculates Text Similarity Score (0 to 1)
 */
export function calculateTextScore(amazonTitle: string, aliTitle: string): number {
    return getTextSimilarity(amazonTitle, aliTitle);
}

/**
 * Calculates Image Similarity Score (0 to 1)
 * Returns 0 if calculation fails or image is missing.
 */
export async function calculateImageScore(amazonImageUrl: string, aliImageUrl: string): Promise<number> {
    if (!amazonImageUrl || !aliImageUrl) return 0;

    try {
        const [hashA, hashB] = await Promise.all([
            getCachedImageHash(amazonImageUrl, getImageHash),
            getCachedImageHash(aliImageUrl, getImageHash)
        ]);
        return getImageSimilarity(hashA, hashB);
    } catch (error) {
        console.warn(`[Scoring] Image similarity failed: ${error}`);
        return 0;
    }
}

/**
 * @deprecated Use calculateTextScore and calculateImageScore directly manually implementing the waterfall logic.
 */
export async function calculateLocalScore(input: ScoringInput): Promise<ScoringResult> {
    const { amazonTitle, amazonImageUrl, aliTitle, aliImageUrl } = input;

    const textSim = calculateTextScore(amazonTitle, aliTitle);
    const imageSim = await calculateImageScore(amazonImageUrl, aliImageUrl);

    // Legacy logic for backward compatibility (if any other part uses it)
    const weightedScore = (textSim * 60) + (imageSim * 40);
    const finalScore = Math.round(weightedScore * 10) / 10;

    let decision: 'fast-pass' | 'ai-verify' | 'reject';
    if (finalScore >= 88) decision = 'fast-pass';
    else if (finalScore >= 70) decision = 'ai-verify';
    else decision = 'reject';

    return { finalScore, textSim, imageSim, decision };
}
