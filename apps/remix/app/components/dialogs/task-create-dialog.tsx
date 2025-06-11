import { useState } from 'react';
import React from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { FilePlus, PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@documenso/ui/primitives/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { PopoverMembers } from '../general/task/popover-member';

type TeamMember = {
  name: string | null;
  email: string;
};
type TaskCreateDialogProps = {
  taskRootPath: string;
  teamId?: number;
  teamMembers?: TeamMember[];
  projectId?: number;
  parentTaskId?: number;
  isLoading?: boolean;
};

export const TaskCreateDialog = ({
  taskRootPath,
  teamId,
  teamMembers,
  isLoading,
  projectId,
  parentTaskId,
}: TaskCreateDialogProps) => {
  const navigate = useNavigate();
  const { user } = useSession(); // Obtenemos el usuario de la sesión
  const { toast } = useToast();
  const { _ } = useLingui();

  const { mutateAsync: createTask } = trpc.task.createTask.useMutation();
  const [selectedUsers, setSelectedUsers] = React.useState<TeamMember[]>([]);
  const [showTaskCreateDialog, setShowTaskCreateDialog] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskData, setTaskData] = useState<{
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    tags: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    setTaskData((prev) => ({ ...prev, priority: value }));
  };

  const onCreateTask = async () => {
    if (isCreatingTask || !user.id) {
      return;
    }

    setIsCreatingTask(true);

    try {
      if (selectedUsers.length > 0) {
        const { id } = await createTask({
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          assignees: selectedUsers,
          // userId: user.id, // Usamos el ID del usuario de la sesión
          // teamId,
          projectId,
          parentTaskId,
        });
      } else {
        const { id } = await createTask({
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          // userId: user.id, // Usamos el ID del usuario de la sesión
          // teamId,
          projectId,
          parentTaskId,
        });
      }

      toast({
        title: _(msg`Task created successfully`),
        description: _(msg`Your task has been created. You will be redirected to the task page.`),
        duration: 5000,
      });

      setShowTaskCreateDialog(false);
      // await navigate(`${taskRootPath}/${id}`);
    } catch (error) {
      console.error('Error creating task:', error);

      let errorDescription = _(msg`Please try again later.`);

      if (error.data?.code === 'P2025') {
        if (error.data?.meta?.modelName === 'User') {
          errorDescription = _(msg`User session is invalid. Please log in again.`);
        } else if (error.data?.meta?.modelName === 'Team') {
          errorDescription = _(msg`The specified team does not exist or you don't have access.`);
        } else if (error.data?.meta?.modelName === 'Project') {
          errorDescription = _(msg`The specified project does not exist or you don't have access.`);
        }
      }

      toast({
        title: _(msg`Failed to create task`),
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTask(false);
      setTaskData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        tags: [],
      });
      setSelectedUsers([]);
      setShowTaskCreateDialog(false);
    }
  };

  const canCreateTask = Boolean(user.id) && !isCreatingTask && taskData.title;

  return (
    <Dialog
      open={showTaskCreateDialog}
      onOpenChange={(value) => !isCreatingTask && setShowTaskCreateDialog(value)}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer" disabled={!user.emailVerified || isLoading}>
          <FilePlus className="-ml-1 mr-2 h-4 w-4" />
          <Trans>New Task</Trans>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create New Task</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Create a new task with details like title, description, priority and due date.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="flex w-full flex-col space-y-4">
          <div>
            <Trans>Title</Trans>
            <Input
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Trans>Description</Trans>
            <Textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleInputChange}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Trans>Priority</Trans>
              <Select value={taskData.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Trans>Due Date</Trans>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskData.dueDate}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>
          </div>

          {/* <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="p-2">
                {users.map((user) => (
                  <CommandItem
                    key={user.email}
                    className="flex items-center px-2"
                    onSelect={() => {
                      if (selectedUsers.some((selectedUser) => selectedUser.email === user.email)) {
                        // Si el usuario ya está seleccionado, lo quitamos
                        setSelectedUsers(
                          selectedUsers.filter((selectedUser) => selectedUser.email !== user.email),
                        );
                      } else {
                        // Si no está seleccionado, lo añadimos a la lista actual
                        setSelectedUsers([...selectedUsers, user]);
                      }
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} alt="Image" />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-muted-foreground text-sm">{user.email}</p>
                    </div>
                    {selectedUsers.some((selectedUser) => selectedUser.email === user.email) ? (
                      <Check className="text-primary ml-auto flex h-5 w-5" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command> */}
          {teamMembers && teamMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <Popover modal={true}>
                <PopoverTrigger asChild className="w-fit">
                  <Button className="min-h-9 min-w-9">
                    <PlusIcon width="25" height="25" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="z-9999 w-fit">
                  <PopoverMembers
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    userArray={teamMembers}
                  />
                </PopoverContent>
              </Popover>

              {selectedUsers.length > 0 ? (
                <div className="flex -space-x-2 overflow-hidden">
                  {selectedUsers.map((user) => (
                    <Avatar key={user.email} className="border-background inline-block border-2">
                      {user.name && <AvatarFallback>{user.name[0]}</AvatarFallback>}
                    </Avatar>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground h-10 text-sm">
                  Select users to add to this thread.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreatingTask}>
              <Trans>Cancel</Trans>
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onCreateTask}
            disabled={!canCreateTask || isCreatingTask}
            loading={isCreatingTask}
          >
            <Trans>Create Task</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
