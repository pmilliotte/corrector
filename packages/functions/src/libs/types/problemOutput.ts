import { z } from 'zod';

export type ProblemOutput = z.infer<typeof problemOutputSchema>['problem'];

export const problemOutputSchema = z.object({
  problem: z
    .object({
      content: z
        .object({
          text: z
            .string()
            .describe(
              "L'énoncé de la question ou le contenu du texte introductif ou intermédiaire, sans inclure les numéros de question. Le langage LaTeX doit être délimité avec un ou deux symboles dollar '$' !",
            ),
          type: z
            .enum(['statement', 'question'])
            .describe(
              "Si le texte correspond à un texte introductif ou intermédiaire, ou s'il s'agit d'une question.",
            ),
          numberOfLines: z
            .number()
            .describe(
              "Le nombre de lignes dont un élève qui écrit très gros a besoin pour répondre à la question de manière complète et strucurée, 0 si s'il s'agit d'un texte introductif ou intermédiaire",
            ),
        })
        .strict()
        .array(),
    })
    .strict(),
});
