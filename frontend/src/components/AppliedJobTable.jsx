import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    
    // Check if any jobs exist
    const hasJobs = allAppliedJobs && allAppliedJobs.length > 0;
    
    if (!hasJobs) {
        return (
            <div className="text-center py-5 text-gray-500">
                You haven't applied to any jobs yet.
            </div>
        );
    }
    
    return (
        <div>
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allAppliedJobs.map((appliedJob) => (
                        <TableRow key={appliedJob.id || appliedJob._id}>
                            <TableCell>{appliedJob?.createdAt?.split("T")[0] || appliedJob?.applied_at}</TableCell>
                            <TableCell>{appliedJob.job?.title}</TableCell>
                            <TableCell>{appliedJob.job?.company?.name || appliedJob.job?.company}</TableCell>
                            <TableCell className="text-right">
                                <Badge className={`${appliedJob?.status === "rejected" ? 'bg-red-400' : appliedJob.status === 'pending' ? 'bg-gray-400' : 'bg-green-400'}`}>
                                    {appliedJob.status.toUpperCase()}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable