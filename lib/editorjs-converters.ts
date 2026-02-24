// Convert existing tool data structures to Editor.js OutputData format

import type { OutputData, OutputBlockData } from '@editorjs/editorjs';
import type { SummaryStructure, Quiz, LessonPlan, SELSTEMActivity } from '@/types';

/**
 * Convert Summary structure to Editor.js blocks
 */
export function summaryToEditorJS(summary: SummaryStructure, chapterText?: string): OutputData {
    const blocks: OutputBlockData[] = [];

    // Chapter name as H1
    blocks.push({
        type: 'header',
        data: {
            text: summary.chapterName,
            level: 1
        }
    });

    // Class level info as paragraph
    blocks.push({
        type: 'paragraph',
        data: {
            text: `<i>Class ${summary.classLevel} Summary</i>`
        }
    });

    // Add delimiter
    blocks.push({
        type: 'delimiter',
        data: {}
    });

    // Convert each main topic
    summary.mainTopics.forEach((topic, topicIndex) => {
        // Main topic as H2
        blocks.push({
            type: 'header',
            data: {
                text: `${topicIndex + 1}. ${topic.name}`,
                level: 2
            }
        });

        // Convert each subtopic
        topic.subTopics.forEach((subTopic, subIndex) => {
            // Subtopic as H3
            blocks.push({
                type: 'header',
                data: {
                    text: `${topicIndex + 1}.${subIndex + 1} ${subTopic.name}`,
                    level: 3
                }
            });

            // Key points as list items
            const listItems = subTopic.keyPoints.map(kp =>
                `<b>${kp.point}:</b> ${kp.description}`
            );

            blocks.push({
                type: 'list',
                data: {
                    style: 'unordered',
                    items: listItems
                }
            });
        });
    });

    return {
        time: Date.now(),
        blocks,
        version: '2.29.0'
    };
}

/**
 * Convert Quiz structure to Editor.js blocks
 */
export function quizToEditorJS(quiz: Quiz): OutputData {
    const blocks: OutputBlockData[] = [];

    // Quiz header
    blocks.push({
        type: 'header',
        data: {
            text: `${quiz.chapterName} - Quiz`,
            level: 1
        }
    });

    // Quiz metadata
    blocks.push({
        type: 'paragraph',
        data: {
            text: `<i>Class ${quiz.classLevel} • ${quiz.questions.length} Questions</i>`
        }
    });

    blocks.push({
        type: 'delimiter',
        data: {}
    });

    // Convert each question
    quiz.questions.forEach((question, index) => {
        // Question header
        blocks.push({
            type: 'header',
            data: {
                text: `Question ${index + 1}`,
                level: 2
            }
        });

        // Question text with type and difficulty tags
        blocks.push({
            type: 'paragraph',
            data: {
                text: `<b>${question.question}</b><br><small>Type: ${question.type} | Difficulty: ${question.difficulty} | Topic: ${question.topic}</small>`
            }
        });

        // Handle different question types
        if (question.type === 'multiple-choice' && question.options) {
            // MCQ options as checklist
            const checklistItems = question.options.map((option, idx) => ({
                text: `${String.fromCharCode(65 + idx)}. ${option}`,
                checked: idx === question.correctAnswer
            }));

            blocks.push({
                type: 'checklist',
                data: {
                    items: checklistItems
                }
            });
        } else if (question.type === 'true-false') {
            // T/F as quote
            blocks.push({
                type: 'quote',
                data: {
                    text: `Answer: ${question.correctAnswer === 'true' ? 'True' : 'False'}`,
                    caption: 'Correct Answer',
                    alignment: 'left'
                }
            });
        } else if (question.type === 'short-answer') {
            // Short answer as quote
            blocks.push({
                type: 'quote',
                data: {
                    text: question.correctAnswer as string,
                    caption: 'Expected Answer',
                    alignment: 'left'
                }
            });
        }

        // Explanation if available
        if (question.explanation) {
            blocks.push({
                type: 'paragraph',
                data: {
                    text: `<i>💡 Explanation: ${question.explanation}</i>`
                }
            });
        }

        // Add delimiter between questions
        if (index < quiz.questions.length - 1) {
            blocks.push({
                type: 'delimiter',
                data: {}
            });
        }
    });

    return {
        time: Date.now(),
        blocks,
        version: '2.29.0'
    };
}

/**
 * Convert Lesson Plan structure to Editor.js blocks
 */
export function lessonPlanToEditorJS(plan: LessonPlan): OutputData {
    const blocks: OutputBlockData[] = [];

    // Title
    blocks.push({
        type: 'header',
        data: {
            text: plan.topic,
            level: 1
        }
    });

    // Metadata
    blocks.push({
        type: 'paragraph',
        data: {
            text: `<i>Class ${plan.classLevel} • ${plan.board} • ${plan.subject}</i><br><i>${plan.lectures.length} lectures • ${plan.totalMinutes} minutes total • ${plan.teachingPace} style</i>`
        }
    });

    blocks.push({
        type: 'delimiter',
        data: {}
    });

    // Convert each lecture
    plan.lectures.forEach((lecture, index) => {
        blocks.push({
            type: 'header',
            data: {
                text: `Lecture ${index + 1}: ${lecture.title}`,
                level: 2
            }
        });

        blocks.push({
            type: 'paragraph',
            data: {
                text: `<i>Duration: ${lecture.duration} minutes | Complexity: ${lecture.complexity}</i>`
            }
        });

        // Topics covered
        if (lecture.topics && lecture.topics.length > 0) {
            blocks.push({
                type: 'header',
                data: {
                    text: 'Topics Covered',
                    level: 3
                }
            });

            blocks.push({
                type: 'list',
                data: {
                    style: 'unordered',
                    items: lecture.topics
                }
            });
        }

        // Recap content if available
        if (lecture.hasRecap && lecture.recapContent) {
            blocks.push({
                type: 'quote',
                data: {
                    text: lecture.recapContent,
                    caption: '🔄 Recap from Previous Lecture',
                    alignment: 'left'
                }
            });
        }

        // Teach Pack Cards
        if (lecture.teachPackCards) {
            const { todaysPlan, start, explain, do: doCard, talk, check } = lecture.teachPackCards;

            if (todaysPlan) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: todaysPlan,
                        caption: '📋 Today\'s Plan',
                        alignment: 'left'
                    }
                });
            }

            if (start) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: start,
                        caption: '🎯 Start - Hook & Engage',
                        alignment: 'left'
                    }
                });
            }

            if (explain) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: explain,
                        caption: '📚 Explain - Core Concept',
                        alignment: 'left'
                    }
                });
            }

            if (doCard) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: doCard,
                        caption: '✍️ Do - Apply Skills',
                        alignment: 'left'
                    }
                });
            }

            if (talk) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: talk,
                        caption: '💬 Talk - Discuss',
                        alignment: 'left'
                    }
                });
            }

            if (check) {
                blocks.push({
                    type: 'quote',
                    data: {
                        text: check,
                        caption: '✅ Check - Assessment',
                        alignment: 'left'
                    }
                });
            }
        }

        // Add delimiter between lectures
        if (index < plan.lectures.length - 1) {
            blocks.push({
                type: 'delimiter',
                data: {}
            });
        }
    });

    return {
        time: Date.now(),
        blocks,
        version: '2.29.0'
    };
}

/**
 * Convert SEL/STEM Activity structure to Editor.js blocks
 */
export function selStemActivityToEditorJS(activity: SELSTEMActivity): OutputData {
    const blocks: OutputBlockData[] = [];

    // Title
    blocks.push({
        type: 'header',
        data: {
            text: activity.title,
            level: 1
        }
    });

    // Metadata
    blocks.push({
        type: 'paragraph',
        data: {
            text: `<i>Class ${activity.classLevel} • ${activity.subject} • ${activity.activityType} activity • ${activity.duration} minutes</i>`
        }
    });

    blocks.push({
        type: 'delimiter',
        data: {}
    });

    // Real World Connection
    blocks.push({
        type: 'header',
        data: {
            text: 'Real World Connection',
            level: 2
        }
    });

    blocks.push({
        type: 'paragraph',
        data: {
            text: activity.realWorldConnection
        }
    });

    // Learning Objectives
    if (activity.learningObjectives && activity.learningObjectives.length > 0) {
        blocks.push({
            type: 'header',
            data: {
                text: 'Learning Objectives',
                level: 2
            }
        });

        blocks.push({
            type: 'list',
            data: {
                style: 'unordered',
                items: activity.learningObjectives
            }
        });
    }

    // Materials
    if (activity.materials && activity.materials.length > 0) {
        blocks.push({
            type: 'header',
            data: {
                text: 'Materials Needed',
                level: 2
            }
        });

        blocks.push({
            type: 'checklist',
            data: {
                items: activity.materials.map(material => ({
                    text: material,
                    checked: false
                }))
            }
        });
    }

    // Instructions
    blocks.push({
        type: 'header',
        data: {
            text: 'Instructions',
            level: 2
        }
    });

    // Setup
    blocks.push({
        type: 'header',
        data: {
            text: 'Setup',
            level: 3
        }
    });

    blocks.push({
        type: 'paragraph',
        data: {
            text: activity.instructions.setup
        }
    });

    // Steps
    blocks.push({
        type: 'header',
        data: {
            text: 'Steps',
            level: 3
        }
    });

    blocks.push({
        type: 'list',
        data: {
            style: 'ordered',
            items: activity.instructions.steps
        }
    });

    // Reflection
    blocks.push({
        type: 'header',
        data: {
            text: 'Reflection',
            level: 3
        }
    });

    blocks.push({
        type: 'paragraph',
        data: {
            text: activity.instructions.reflection
        }
    });

    return {
        time: Date.now(),
        blocks,
        version: '2.29.0'
    };
}
