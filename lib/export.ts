import type { SummaryStructure, JsMindData } from '@/types';

/**
 * Export summary as plain text
 */
export function exportSummaryAsText(summary: SummaryStructure): string {
    let text = `${summary.chapterName} - Class ${summary.classLevel} Summary\n`;
    text += '='.repeat(60) + '\n\n';

    summary.mainTopics.forEach((topic, topicIndex) => {
        text += `${topicIndex + 1}. ${topic.name}\n`;
        text += '-'.repeat(50) + '\n';

        topic.subTopics.forEach((subTopic, subTopicIndex) => {
            text += `   ${topicIndex + 1}.${subTopicIndex + 1} ${subTopic.name}\n`;

            subTopic.keyPoints.forEach((keyPoint) => {
                text += `      • ${keyPoint.point}\n`;
                text += `        ${keyPoint.description}\n\n`;
            });
        });
        text += '\n';
    });

    return text;
}

/**
 * Download text file
 */
export function downloadTextFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Export summary as Markdown
 */
export function exportSummaryAsMarkdown(summary: SummaryStructure): string {
    let md = `# ${summary.chapterName}\n\n`;
    md += `**Class ${summary.classLevel} Summary**\n\n`;
    md += '---\n\n';

    summary.mainTopics.forEach((topic, topicIndex) => {
        md += `## ${topicIndex + 1}. ${topic.name}\n\n`;

        topic.subTopics.forEach((subTopic, subTopicIndex) => {
            md += `### ${topicIndex + 1}.${subTopicIndex + 1} ${subTopic.name}\n\n`;

            subTopic.keyPoints.forEach((keyPoint) => {
                md += `- **${keyPoint.point}**\n`;
                md += `  ${keyPoint.description}\n\n`;
            });
        });
    });

    return md;
}

/**
 * Trigger browser print dialog
 */
export function printPage(): void {
    window.print();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Export mind map canvas as high-resolution PNG
 */
export function exportMindMapAsHighResPNG(
    canvas: HTMLCanvasElement,
    filename: string,
    scale: number = 2
): void {
    // Create a higher resolution canvas
    const highResCanvas = document.createElement('canvas');
    const ctx = highResCanvas.getContext('2d');

    if (!ctx) return;

    highResCanvas.width = canvas.width * scale;
    highResCanvas.height = canvas.height * scale;

    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = filename;
    link.href = highResCanvas.toDataURL('image/png');
    link.click();
}

/**
 * Create a shareable link (for future implementation with backend)
 */
export function generateShareableData(
    summary: SummaryStructure,
    mindMapData: JsMindData
): string {
    const data = {
        summary,
        mindMapData,
        timestamp: Date.now(),
    };

    // For now, return base64 encoded data
    // In production, this would upload to a server and return a short URL
    return btoa(JSON.stringify(data));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Export quiz as student worksheet (questions only, no answers)
 */
export function exportQuizAsWorksheet(quiz: any): string {
    let text = `${quiz.chapterName} - Class ${quiz.classLevel} Quiz\n`;
    text += '='.repeat(60) + '\n';
    text += `Name: ____________________  Date: __________\n\n`;

    const mcqQuestions = quiz.questions.filter((q: any) => q.type === 'multiple-choice');
    const tfQuestions = quiz.questions.filter((q: any) => q.type === 'true-false');
    const saQuestions = quiz.questions.filter((q: any) => q.type === 'short-answer');

    if (mcqQuestions.length > 0) {
        text += 'SECTION A: MULTIPLE CHOICE\n';
        text += '-'.repeat(60) + '\n\n';
        mcqQuestions.forEach((q: any, idx: number) => {
            text += `${idx + 1}. ${q.question}\n`;
            q.options.forEach((opt: string, optIdx: number) => {
                text += `   ${String.fromCharCode(65 + optIdx)}. ${opt}\n`;
            });
            text += '\n';
        });
    }

    if (tfQuestions.length > 0) {
        text += '\nSECTION B: TRUE/FALSE\n';
        text += '-'.repeat(60) + '\n\n';
        tfQuestions.forEach((q: any, idx: number) => {
            text += `${idx + 1}. ${q.question}\n`;
            text += '   Answer: _______\n\n';
        });
    }

    if (saQuestions.length > 0) {
        text += '\nSECTION C: SHORT ANSWER\n';
        text += '-'.repeat(60) + '\n\n';
        saQuestions.forEach((q: any, idx: number) => {
            text += `${idx + 1}. ${q.question}\n`;
            text += '   _'.repeat(50) + '\n';
            text += '   _'.repeat(50) + '\n\n';
        });
    }

    return text;
}

/**
 * Export quiz with answers (answer key)
 */
export function exportQuizWithAnswers(quiz: any): string {
    let text = `${quiz.chapterName} - Class ${quiz.classLevel} Quiz - ANSWER KEY\n`;
    text += '='.repeat(60) + '\n\n';

    quiz.questions.forEach((q: any, idx: number) => {
        text += `${idx + 1}. ${q.question}\n`;

        if (q.type === 'multiple-choice') {
            q.options.forEach((opt: string, optIdx: number) => {
                const marker = optIdx === q.correctAnswer ? '✓' : ' ';
                text += `   [${marker}] ${String.fromCharCode(65 + optIdx)}. ${opt}\n`;
            });
        } else if (q.type === 'true-false') {
            text += `   Answer: ${q.correctAnswer}\n`;
        } else if (q.type === 'short-answer') {
            text += `   Answer: ${q.correctAnswer}\n`;
        }

        if (q.explanation) {
            text += `   💡 ${q.explanation}\n`;
        }

        text += `   [${q.difficulty}] Topic: ${q.topic}\n\n`;
    });

    return text;
}

/**
 * Export quiz as combined (worksheet + answer key)
 */
export function exportQuizCombined(quiz: any): string {
    const worksheet = exportQuizAsWorksheet(quiz);
    const answers = exportQuizWithAnswers(quiz);

    return worksheet + '\n\n' + '='.repeat(60) + '\n\n' + answers;
}
