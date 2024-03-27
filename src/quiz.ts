
/**
 * A class that represents a quiz
 */
export class Quiz {
    id!: number;
    creationDateTime!: string;
    questions!: string[];
    userAnswers!: (number|null)[];
    correctAnswers!: number[];
    score!: number;
    userId!: string;


    /* quizzes for testing:
    
    static testQuiz1: Quiz =
        {
            "id": 1,
            "creationDateTime": new Date().toLocaleString(),
            "questions": ["1+1", "2-4", "3*4", "4+5", "5-6", "6*9", "7+50", "8-12", "9*3", "10+1"],
            "userAnswers": [-1, -2, -3, -4, -5, null, -7, -8, -9, -10],
            "correctAnswers": [2, -2, 12, 9, -1, 54, 57, -4, 27, 11],
            "score": 1,
            "userId": "1"
        };

    static testQuiz2: Quiz =
        {
            "id": 2,
            "creationDateTime": new Date().toLocaleString(),
            "questions": ["1+1", "2-4", "3*4", "4+5", "5-6", "6*9", "7+50", "8-12", "9*3", "10+1"],
            "userAnswers": [2, -2, 12, 9, -1, -6, -7, -8, -9, -10],
            "correctAnswers": [2, -2, 12, 9, -1, 54, 57, -4, 27, 11],
            "score": 5,
            "userId": "1"
        };

    static testQuiz3: Quiz =
        {
            "id": 3,
            "creationDateTime": new Date().toLocaleString(),
            "questions": ["1+1", "2-4", "3*4", "4+5", "5-6", "6*9", "7+50", "8-12", "9*3", "10+1"],
            "userAnswers": [2, -2, 12, 9, -1, 54, 57, -8, -9, -10],
            "correctAnswers": [2, -2, 12, 9, -1, 54, 57, -4, 27, 11],
            "score": 7,
            "userId": "1"
        };
    static testQuizData: Quiz[] = [this.testQuiz1, this.testQuiz2, this.testQuiz3];

    static generatedQuestions: string[] = ["1+1", "2-4", "3*4", "4+5", "5-6", "6*9", "7+50", "8-12", "9*3", "10+1"];
    static correctAnswers: number[] = [2, -2, 12, 9, -1, 54, 57, -4, 27, 11];

    static getTestQuiz(quizId: number): Quiz {
        switch (quizId) {
            case 1:
                return this.testQuiz1;
            case 2:
                return this.testQuiz2;
            case 3:
                return this.testQuiz3;
            default:
                return this.testQuiz1;
        }
    }

    static getTestQuizWithAnswers(quizId: number): any {
        switch (quizId) {
            case 1:
                return {
                    "quiz": this.testQuiz1,
                    "correctAnswers": this.correctAnswers
                };
            case 2:
                return {
                    "quiz": this.testQuiz2,
                    "correctAnswers": this.correctAnswers
                };
            case 3:
                return {
                    "quiz": this.testQuiz3,
                    "correctAnswers": this.correctAnswers
                };
            default:
                return {
                    "quiz": this.testQuiz1,
                    "correctAnswers": this.correctAnswers
                };
        }
    }

    static generateQuestions(numberOfQuestions: number): string[] {
        return this.generatedQuestions;
    }

    */
}