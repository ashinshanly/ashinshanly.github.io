import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { db } from '../../config/firebase';
import { ref, onValue, set, get } from 'firebase/database';

const problems = [
    {
        id: 1,
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        template: "def two_sum(nums, target):\n    # Write your code here\n    pass",
        testCases: [
            { input: [[2,7,11,15], 9], expected: [0,1] },
            { input: [[3,2,4], 6], expected: [1,2] }
        ]
    }
];

export function CodingChallenges() {
    const [gameMode, setGameMode] = useState('home');
    const [currentUser, setCurrentUser] = useState('');
    const [currentProblem, setCurrentProblem] = useState(0);
    const [code, setCode] = useState(problems[0]?.template || '');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const leaderboardRef = ref(db, 'coding-challenges/leaderboard');
        const unsubscribe = onValue(leaderboardRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const sortedLeaderboard = Object.values(data).sort((a, b) => b.score - a.score);
                setLeaderboard(sortedLeaderboard);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleCodeSubmit = async () => {
        try {
            // Evaluate code safely and check test cases
            const problem = problems[currentProblem];
            const allTestsPassed = problem.testCases.every(testCase => {
                const result = eval(`(${code})(${JSON.stringify(testCase.input)})`);
                return JSON.stringify(result) === JSON.stringify(testCase.expected);
            });

            if (allTestsPassed) {
                if (currentProblem < problems.length - 1) {
                    setCurrentProblem(prev => prev + 1);
                    setCode(problems[currentProblem + 1].template);
                } else {
                    // Update leaderboard
                    const leaderboardRef = ref(db, `coding-challenges/leaderboard/${currentUser}`);
                    await set(leaderboardRef, {
                        name: currentUser,
                        score: (currentProblem + 1) * 100
                    });
                    setGameMode('home');
                }
            }
        } catch (error) {
            console.error('Code execution error:', error);
        }
    };

    if (gameMode === 'home') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-4 space-y-6">
                <h1 className="text-3xl font-bold text-white mb-4">Coding Challenges</h1>
                
                <div className="w-full max-w-md bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-xl text-white mb-2">Leaderboard</h2>
                    {leaderboard.map((entry, index) => (
                        <div key={index} className="text-white">
                            {entry.name}: {entry.score}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your display name"
                        className="w-64 px-4 py-2 rounded"
                        onChange={(e) => setCurrentUser(e.target.value)}
                    />
                    <button 
                        onClick={() => currentUser && setGameMode('playing')}
                        className="w-64 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Start Challenge
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 p-4">
            <div className="text-white mb-4">
                <h2 className="text-2xl">{problems[currentProblem].title}</h2>
                <p>{problems[currentProblem].description}</p>
            </div>
            
            <div className="flex-1">
                <CodeMirror
                    value={code}
                    height="400px"
                    theme="dark"
                    extensions={[python()]}
                    onChange={(value) => setCode(value)}
                />
            </div>

            <div className="mt-4 space-x-4">
                <button 
                    onClick={handleCodeSubmit}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    Submit Solution
                </button>
                <button 
                    onClick={() => setGameMode('home')}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
}

export const displayCodingChallenges = () => {
    return <CodingChallenges />;
}
