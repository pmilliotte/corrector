import { Plus } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui';

import { CreateExamForm } from './CreateExamForm';

export const CreateExamDialog = (): ReactElement => (
  <Dialog>
    <DialogTrigger asChild>
      <Button size="sm" className="gap-1" variant="outline">
        <Plus size={16} />
        <FormattedMessage id="exams.create" />
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          <FormattedMessage id="exams.create" />
        </DialogTitle>
        <DialogDescription>
          <FormattedMessage id="exams.createDescription" />
        </DialogDescription>
      </DialogHeader>
      <CreateExamForm />
    </DialogContent>
  </Dialog>
);
