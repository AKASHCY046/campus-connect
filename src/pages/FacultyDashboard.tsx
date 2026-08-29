import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2, Search, FileText, ClipboardList, Users, MessageSquare } from 'lucide-react';
import { UploadResourceDialog } from '@/components/dialogs/UploadResourceDialog';
import { CreateAssignmentDialog } from '@/components/dialogs/CreateAssignmentDialog';
import { CreateStudyGroupDialog } from '@/components/dialogs/CreateStudyGroupDialog';
import { ForumManagementDialog } from '@/components/dialogs/ForumManagementDialog';
import { EditResourceDialog } from '@/components/dialogs/EditResourceDialog';
import { EditAssignmentDialog } from '@/components/dialogs/EditAssignmentDialog';
import { EditStudyGroupDialog } from '@/components/dialogs/EditStudyGroupDialog';
import { EditForumDialog } from '@/components/dialogs/EditForumDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import {
  getResources,
  getAssignments,
  getForums,
  getStudyGroupsWithMembers,
  deleteResource,
  deleteAssignment,
  deleteStudyGroup,
  deleteForum,
} from '@/lib/services/academic';
import { getGroupCode, getForumCode, getResourceCode } from '@/lib/joinCodes';
import { queryKeys, invalidateQueriesForMutation } from '@/lib/query-utils';

const TABS = ['resources', 'tests', 'groups', 'forums', 'performance'] as const;
type Tab = (typeof TABS)[number];

export default function FacultyDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const queryClient = useQueryClient();

  const tab = React.useMemo<Tab>(() => {
    const t = new URLSearchParams(location.search).get('tab') as Tab;
    return TABS.includes(t) ? t : 'resources';
  }, [location.search]);
  const setTab = (t: string) => navigate(`/faculty?tab=${t}`, { replace: true });

  const [resourceSearch, setResourceSearch] = React.useState('');
  const [testSearch, setTestSearch] = React.useState('');
  const [groupSearch, setGroupSearch] = React.useState('');
  const [forumSearch, setForumSearch] = React.useState('');

  const { data: resources = [], isLoading: loadingResources } = useQuery({
    queryKey: queryKeys.resources.all,
    queryFn: getResources,
  });
  const { data: tests = [], isLoading: loadingTests } = useQuery({
    queryKey: queryKeys.assignments.all,
    queryFn: getAssignments,
  });
  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: queryKeys.groups.all,
    queryFn: getStudyGroupsWithMembers,
  });
  const { data: forums = [], isLoading: loadingForums } = useQuery({
    queryKey: queryKeys.forums.all,
    queryFn: getForums,
  });

  const uid = profile?.id;
  const myResources = React.useMemo(
    () =>
      resources.filter(
        (r: any) =>
          r.uploaded_by === uid && r.title.toLowerCase().includes(resourceSearch.toLowerCase()),
      ),
    [resources, uid, resourceSearch],
  );
  const myTests = React.useMemo(
    () =>
      tests.filter(
        (a: any) => a.created_by === uid && a.title.toLowerCase().includes(testSearch.toLowerCase()),
      ),
    [tests, uid, testSearch],
  );
  const myGroups = React.useMemo(
    () =>
      groups.filter(
        (g: any) => g.created_by === uid && g.name.toLowerCase().includes(groupSearch.toLowerCase()),
      ),
    [groups, uid, groupSearch],
  );
  const myForums = React.useMemo(
    () =>
      forums.filter(
        (f: any) =>
          f.author_id === uid && f.topic.toLowerCase().includes(forumSearch.toLowerCase()),
      ),
    [forums, uid, forumSearch],
  );

  const perf = React.useMemo(() => {
    const resourceAccess = JSON.parse(localStorage.getItem('campus_resource_access') || '[]');
    const groupMembers = JSON.parse(localStorage.getItem('campus_group_memberships') || '[]');
    const myResourceIds = myResources.map((r: any) => r.id);
    const myGroupIds = myGroups.map((g: any) => g.id);
    const withAccess = resourceAccess.filter((a: any) => myResourceIds.includes(a.resourceId));
    const inGroups = groupMembers.filter((m: any) => myGroupIds.includes(m.resourceId));
    const uniqueStudents = new Set([
      ...withAccess.map((s: any) => s.userId),
      ...inGroups.map((s: any) => s.userId),
    ]);
    return {
      studentsReached: uniqueStudents.size,
      resourceAccessCount: withAccess.length,
      groupMemberships: inGroups.length,
      assignmentSubmissions: myTests.reduce(
        (sum: number, t: any) => sum + (t.submissions?.length || t.submissions?.count || 0),
        0,
      ),
    };
  }, [myResources, myTests, myGroups]);

  const refresh = (type: string) => invalidateQueriesForMutation(queryClient, type);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2">
          <span className={theme === 'cyber' ? 'text-gradient' : ''}>Faculty Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          Share materials, set assignments and track student engagement.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={FileText} tint="text-blue-500" value={myResources.length} label="Materials shared" />
        <Stat icon={ClipboardList} tint="text-violet-500" value={myTests.length} label="Assignments" />
        <Stat icon={Users} tint="text-emerald-500" value={myGroups.length} label="Study groups" />
        <Stat icon={MessageSquare} tint="text-amber-500" value={myForums.length} label="Forums" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
          <TabsTrigger value="resources">Materials</TabsTrigger>
          <TabsTrigger value="tests">Assignments</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="forums">Forums</TabsTrigger>
          <TabsTrigger value="performance">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          <Panel
            title="Study materials"
            action={<UploadResourceDialog onCreate={() => refresh('resource')} />}
            search={resourceSearch}
            onSearch={setResourceSearch}
            placeholder="Search materials…"
            loading={loadingResources}
            empty={myResources.length === 0}
            emptyText="You haven't shared any materials yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Access code</TableHead>
                  <TableHead>Shared</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myResources.map((res: any) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.title}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{res.category}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {res.join_code || getResourceCode(res.id) || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(res.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        edit={<EditResourceDialog resource={res} onSuccess={() => refresh('resource')} />}
                        onDelete={() => deleteResource(res.id)}
                        label={res.title}
                        onDeleted={() => refresh('resource')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="tests">
          <Panel
            title="Tests & assignments"
            action={<CreateAssignmentDialog onCreate={() => refresh('assignment')} />}
            search={testSearch}
            onSearch={setTestSearch}
            placeholder="Search assignments…"
            loading={loadingTests}
            empty={myTests.length === 0}
            emptyText="No assignments yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTests.map((test: any) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.title}</TableCell>
                    <TableCell className="text-muted-foreground">{test.subject}</TableCell>
                    <TableCell>{new Date(test.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {test.submissions?.length ?? test.submissions?.count ?? 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        edit={
                          <EditAssignmentDialog
                            assignment={test}
                            onSuccess={() => refresh('assignment')}
                          />
                        }
                        onDelete={() => deleteAssignment(test.id)}
                        label={test.title}
                        onDeleted={() => refresh('assignment')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="groups">
          <Panel
            title="Project groups"
            action={<CreateStudyGroupDialog onCreate={() => refresh('group')} />}
            search={groupSearch}
            onSearch={setGroupSearch}
            placeholder="Search groups…"
            loading={loadingGroups}
            empty={myGroups.length === 0}
            emptyText="No groups yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Join code</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myGroups.map((group: any) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">{group.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {group.join_code || getGroupCode(group.id) || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.members?.length || 0}</Badge>
                      {group.members?.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {group.members
                            .slice(0, 2)
                            .map((m: any) => m.full_name)
                            .join(', ')}
                          {group.members.length > 2 && ` +${group.members.length - 2}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        edit={
                          <EditStudyGroupDialog group={group} onSuccess={() => refresh('group')} />
                        }
                        onDelete={() => deleteStudyGroup(group.id)}
                        label={group.name}
                        onDeleted={() => refresh('group')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="forums">
          <Panel
            title="Academic forums"
            action={<ForumManagementDialog onCreate={() => refresh('forum')} />}
            search={forumSearch}
            onSearch={setForumSearch}
            placeholder="Search forums…"
            loading={loadingForums}
            empty={myForums.length === 0}
            emptyText="No forums yet."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Join code</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myForums.map((forum: any) => (
                  <TableRow key={forum.id}>
                    <TableCell className="font-medium">{forum.topic}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {forum.join_code || getForumCode(forum.id) || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{forum.posts?.count ?? forum.posts?.[0]?.count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        edit={<EditForumDialog forum={forum} onSuccess={() => refresh('forum')} />}
                        onDelete={() => deleteForum(forum.id)}
                        label={forum.topic}
                        onDeleted={() => refresh('forum')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={FileText} tint="text-blue-500" value={myResources.length} label="Resources shared" />
            <Stat icon={ClipboardList} tint="text-violet-500" value={myTests.length} label="Assignments" />
            <Stat icon={Users} tint="text-emerald-500" value={perf.studentsReached} label="Students reached" />
            <Stat
              icon={MessageSquare}
              tint="text-amber-500"
              value={perf.assignmentSubmissions}
              label="Submissions"
            />
          </div>
          <Card className="p-6">
            <h2 className="mb-5">Student engagement</h2>
            <div className="space-y-5">
              <Meter label="Resource unlocks" value={perf.resourceAccessCount} tint="bg-blue-500" />
              <Meter label="Group memberships" value={perf.groupMemberships} tint="bg-violet-500" />
              <Meter label="Assignment submissions" value={perf.assignmentSubmissions} tint="bg-emerald-500" />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="mb-4">Access by material</h2>
            {myResources.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Share a material to start tracking access.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myResources.map((res: any) => {
                    const list = JSON.parse(localStorage.getItem('campus_resource_access') || '[]').filter(
                      (a: any) => a.resourceId === res.id,
                    );
                    return (
                      <TableRow key={res.id}>
                        <TableCell>{res.title}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {res.join_code || getResourceCode(res.id) || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{list.length}</Badge>
                          {list.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              {list.map((a: any) => a.fullName).join(', ')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  icon: Icon,
  tint,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <Card className="p-5">
      <Icon className={`mb-3 h-7 w-7 ${tint}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

function Meter({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tint} transition-all`} style={{ width: `${Math.min(100, value * 12)}%` }} />
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  search,
  onSearch,
  placeholder,
  loading,
  empty,
  emptyText,
  children,
}: {
  title: string;
  action: React.ReactNode;
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  loading: boolean;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2>{title}</h2>
        {action}
      </div>
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-14">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : empty ? (
        <p className="py-14 text-center text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </Card>
  );
}

function RowActions({
  edit,
  onDelete,
  label,
  onDeleted,
}: {
  edit: React.ReactNode;
  onDelete: () => Promise<void>;
  label: string;
  onDeleted: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      {edit}
      <DeleteConfirmationDialog
        title={`Delete “${label}”`}
        description={`This will permanently remove “${label}”.`}
        onConfirm={onDelete}
        successMessage={`“${label}” deleted`}
        onSuccess={onDeleted}
      />
    </div>
  );
}
