/* eslint-disable formatjs/no-literal-string-in-jsx */
import { ArrowRight, FileStack, FileText } from 'lucide-react';
import { ReactElement } from 'react';

import { Exam } from '@corrector/functions';

import { trpc } from '~/lib';

import { LoadingButton } from '../shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui';

type UploadSelectProps = {
  exam: Exam;
};

export const UploadSelect = ({ exam }: UploadSelectProps): ReactElement => {
  const utils = trpc.useUtils();
  const { mutate, isPending, variables } = trpc.examUploadFiles.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
    },
  });

  return (
    <div className="flex gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Utiliser un sujet existant</CardTitle>
          <CardDescription>Télécharger le sujet au format PDF.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <FileText size={64} className="text-muted-foreground" />
        </CardContent>
        <CardFooter>
          <LoadingButton
            label="Télécharger"
            Icon={ArrowRight}
            loading={isPending && variables.status === 'uploadSubject'}
            onClick={() => mutate({ examId: exam.id, status: 'uploadSubject' })}
          />
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Générer un sujet</CardTitle>
          <CardDescription>
            Télécharger plusieurs exercices sous forme d&lsquo;images.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <FileStack size={64} className="text-muted-foreground" />
        </CardContent>
        <CardFooter>
          <LoadingButton
            label="Télécharger"
            Icon={ArrowRight}
            loading={isPending && variables.status === 'uploadFiles'}
            onClick={() => mutate({ examId: exam.id, status: 'uploadFiles' })}
          />
        </CardFooter>
      </Card>

      {/* </Button> */}
    </div>
  );
};
