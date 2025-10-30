import { Circle, Clock, ExternalLink, Folder, GitBranch, Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cn } from '@/lib/utils';

export default async function ProjectsPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  // Fetch user's projects directly using session.user.id
  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your AI-powered applications</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-[#0e639c] hover:bg-[#1177bb] text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="bg-[#252526] border-[#3e3e42]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-gray-500 mb-3" />
              <h2 className="text-lg font-medium text-white mb-1">No projects yet</h2>
              <p className="text-sm text-gray-400 mb-5">Create your first AI-powered application</p>
              <Link href="/projects/new">
                <Button className="bg-[#0e639c] hover:bg-[#1177bb] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-[#252526] border-[#3e3e42] hover:border-[#007acc] transition-all duration-200 cursor-pointer"
              >
                <Link href={`/projects/${project.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <CardTitle className="text-base text-white truncate">
                          {project.name}
                        </CardTitle>
                      </div>
                      <StatusIndicator status={project.status} />
                    </div>
                    <CardDescription className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {project.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(project.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* {project.githubRepo && ( // causing issue with ssr
                          <a
                            href={`https://github.com/${project.githubRepo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-[#37373d]"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        )} */}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const { color, pulseColor, label } = getStatusInfo(status);

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Circle className={cn('h-2 w-2', color)} fill="currentColor" />
        {(status === 'INITIALIZING' || status === 'DEPLOYING') && (
          <Circle
            className={cn('h-2 w-2 absolute top-0 left-0 animate-ping', pulseColor)}
            fill="currentColor"
          />
        )}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'READY':
    case 'DEPLOYED':
      return {
        color: 'text-green-500',
        pulseColor: '',
        label: 'Ready',
      };
    case 'INITIALIZING':
      return {
        color: 'text-yellow-500',
        pulseColor: 'text-yellow-500 opacity-75',
        label: 'Initializing',
      };
    case 'DEPLOYING':
      return {
        color: 'text-yellow-500',
        pulseColor: 'text-yellow-500 opacity-75',
        label: 'Deploying',
      };
    case 'ERROR':
      return {
        color: 'text-red-500',
        pulseColor: '',
        label: 'Error',
      };
    default:
      return {
        color: 'text-gray-500',
        pulseColor: '',
        label: 'Stopped',
      };
  }
}
