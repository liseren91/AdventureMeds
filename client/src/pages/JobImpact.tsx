import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MOCK_JOBS } from "@/lib/mockData";

type SortField = "title" | "aiImpact" | "tasksCount" | "aisCount";
type SortOrder = "asc" | "desc";

export default function JobImpact() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("aiImpact");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = MOCK_JOBS;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.category.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [searchQuery, sortField, sortOrder]);

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (impact >= 60) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (impact >= 40) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Job Impact Index</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Job Impact Index</h1>
          <p className="text-muted-foreground mt-2">
            Analyze how AI is transforming different professions
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-md p-6 space-y-3">
          <h2 className="text-lg font-semibold">Impact of AI on Jobs</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Impact score as computed by TAAFT is expressed as a percentage where <strong>0%</strong> indicates that AI has no impact on that job and <strong>100%</strong> indicates that AI impacts almost every aspect of that job as it was before AI (this does not necessarily mean that the job will cease to exist, only that it's likely to change).
          </p>
          <div className="pt-2">
            <h3 className="text-sm font-semibold mb-2">How the Impact score is calculated</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Impact score takes into account which tasks can be performed with AI, as well as factors such as the relevancy of those tasks for each job, the AI impact score of each task, the number of AIs available for each task and the capabilities of each individual AI within each task.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a specific job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-job-search"
          />
        </div>

        <div className="bg-card border border-card-border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md transition-colors"
                    data-testid="sort-title"
                  >
                    Job Title
                    <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("aiImpact")}
                    className="flex items-center gap-2 hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md transition-colors"
                    data-testid="sort-impact"
                  >
                    AI Impact
                    <SortIcon field="aiImpact" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("tasksCount")}
                    className="flex items-center gap-2 hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md transition-colors"
                    data-testid="sort-tasks"
                  >
                    Tasks
                    <SortIcon field="tasksCount" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("aisCount")}
                    className="flex items-center gap-2 hover-elevate active-elevate-2 -mx-2 px-2 py-1 rounded-md transition-colors"
                    data-testid="sort-ais"
                  >
                    AIs
                    <SortIcon field="aisCount" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No jobs found matching your search
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedJobs.map((job, index) => (
                  <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium" data-testid={`text-job-title-${job.id}`}>
                          {job.title}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {job.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getImpactColor(job.aiImpact)}
                        data-testid={`badge-impact-${job.id}`}
                      >
                        {job.aiImpact}%
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-tasks-${job.id}`}>
                      {job.tasksCount}
                    </TableCell>
                    <TableCell data-testid={`text-ais-${job.id}`}>
                      {job.aisCount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedJobs.length} of {MOCK_JOBS.length} jobs
        </div>
      </div>
    </div>
  );
}
