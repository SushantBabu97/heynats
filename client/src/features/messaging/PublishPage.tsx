import { useQuery } from '@tanstack/react-query';
import { PageIntro } from '@/components/PageStates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { publishApi } from '@/lib/api';
import { BatchPublishForm } from './BatchPublishForm';
import { RequestReplyForm } from './RequestReplyForm';
import { SinglePublishForm } from './SinglePublishForm';

export function PublishPage() {
  const { data: subjectsData } = useQuery({
    queryKey: ['publish-subjects'],
    queryFn: publishApi.getSubjects,
    staleTime: 5 * 60 * 1000,
  });
  const suggestions = subjectsData?.subjects || [];

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-full">
        <PageIntro description="Send messages to subjects, in bulk, or as a request awaiting a reply." />

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Message</TabsTrigger>
            <TabsTrigger value="batch">Batch Messages</TabsTrigger>
            <TabsTrigger value="request-reply">Request-Reply</TabsTrigger>
          </TabsList>

          {/* forceMount keeps each form's inputs when switching tabs */}
          <TabsContent value="single" forceMount className="space-y-4">
            <SinglePublishForm suggestions={suggestions} />
          </TabsContent>
          <TabsContent value="batch" forceMount className="space-y-4">
            <BatchPublishForm suggestions={suggestions} />
          </TabsContent>
          <TabsContent value="request-reply" forceMount className="space-y-4">
            <RequestReplyForm suggestions={suggestions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
