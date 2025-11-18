import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as academicService from '../../services/academicService';
import { Timetable, TimetableEntry } from '../../types';

const TimetableVotePage: React.FC = () => {
    const { user } = useAuth();
    const [proposals, setProposals] = useState<Timetable[]>([]);
    const [voteResults, setVoteResults] = useState<number[]>([]);
    const [userVote, setUserVote] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isFinalized, setIsFinalized] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user?.courseId) {
            setError("You are not enrolled in any course.");
            setLoading(false);
            return;
        }
        try {
            const [proposedData, resultsData, finalData] = await Promise.all([
                 academicService.getProposedTimetables(user.courseId),
                 academicService.getVoteResults(user.courseId),
                 academicService.getFinalTimetable(user.courseId)
            ]);

            if (finalData) {
                setIsFinalized(true);
            }

            if (proposedData) {
                setProposals(proposedData);
                setVoteResults(resultsData.votes);
                setUserVote(resultsData.userVote);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch timetable proposals.");
        } finally {
            setLoading(false);
        }
    }, [user?.courseId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVote = async (option: number) => {
        if (!user || !user.courseId) return;
        setLoading(true);
        try {
            await academicService.castVote(user.id, user.courseId, option);
            setSuccess(`Your vote for Option ${option} has been recorded!`);
            fetchData(); // Refresh data to show new vote counts
        } catch (err: any) {
            setError(err.message || "Failed to cast vote.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleFinalize = async () => {
        if (!user?.courseId) return;
        setLoading(true);
        try {
            await academicService.finalizeTimetable(user.courseId);
            setSuccess("The timetable has been finalized based on the votes!");
            setIsFinalized(true);
            setProposals([]); // Clear proposals as they are no longer valid
        } catch (err: any) {
            setError(err.message || "Failed to finalize timetable.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Vote for Your Timetable</h1>
            {error && <div className="p-3 text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg mb-4">{error}</div>}
            {success && <div className="p-3 text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-lg mb-4">{success}</div>}

            {isFinalized && (
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-bold mb-2">Voting is Closed!</h2>
                    <p>The timetable for your course has been finalized. You can view it on the 'My Timetable' page.</p>
                </div>
            )}
            
            {!isFinalized && proposals.length === 0 && !loading && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-bold mb-2">No Active Polls</h2>
                    <p>There are currently no timetable proposals to vote on for your course.</p>
                </div>
            )}

            <div className="space-y-8">
                {proposals.map((proposal, index) => (
                    <div key={proposal.option} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Option {proposal.option}</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">AI Reasoning: {proposal.reasoning}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{voteResults[index] || 0}</p>
                                <p className="text-sm text-gray-500">Votes</p>
                            </div>
                        </div>
                        <TimetableDisplay schedule={proposal.schedule} />
                        <button 
                            onClick={() => handleVote(proposal.option)}
                            disabled={userVote !== null || loading}
                            className={`mt-4 w-full py-2 px-4 font-semibold rounded-lg shadow-md transition-colors ${
                                userVote === proposal.option 
                                ? 'bg-green-600 text-white' 
                                : 'bg-primary text-white hover:bg-primary-dark'
                            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {userVote === proposal.option ? 'Voted' : (userVote !== null ? 'You have already voted' : 'Vote for this Option')}
                        </button>
                    </div>
                ))}
            </div>
            
             {proposals.length > 0 && (
                <div className="mt-8 flex justify-end">
                    <button onClick={handleFinalize} disabled={loading} className="py-2 px-6 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400">
                        Finalize Timetable (Faculty/Admin Action)
                    </button>
                </div>
            )}
        </div>
    );
};

const TimetableDisplay: React.FC<{ schedule: TimetableEntry[] }> = ({ schedule }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Day</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schedule.map((entry, index) => (
                    <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.day}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.time}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.subject} ({entry.faculty}) in {entry.classroom}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default TimetableVotePage;
