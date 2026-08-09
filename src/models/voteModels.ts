// Election Interface
interface Election {
  electionId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

// Candidate Interface
interface Candidate {
  electionId: string;
  candidateId: string;
  name: string;
  affiliation: string;
  voteCount: number;
}


interface Vote {
  electionId: string;
  candidateId: string;
  proof: string;
}

// returned by GetResults.
interface VotingResult {
  electionId: string;
  candidateId: string;
  name: string;
  affiliation: string;
  voteCount: number;
  votePercentage: number; // 0-100, rounded to 2 decimals
  rank: number;           // 1 = most votes
}

interface VotingResultSummary {
  electionId: string;
  totalVotes: number;
  results: VotingResult[];
}
