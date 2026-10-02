import { z } from 'zod';

export const registerFormSchema = z.object({
  firstName: z
    .string()
    .nonempty('נא להזין שם פרטי')
    .max(50, 'שם פרטי עד 50 תווים'),
  lastName: z
    .string()
    .nonempty('נא להזין שם משפחה')
    .max(50, 'שם משפחה עד 50 תווים'),
  email: z
    .string()
    .nonempty('נא להזין אימייל')
    .email('כתובת אימייל לא תקינה')
    .max(60, 'אימייל עד 60 תווים'),
  password: z
    .string()
    .nonempty('נא להזין סיסמה')
    .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
      message:
        'הסיסמה חייבת להכיל אות גדולה באנגלית, ספרה ותו מיוחד'
    })
    .max(64, 'הסיסמה עד 64 תווים'),
  phone: z
    .string()
    .min(6, 'נא להזין מספר טלפון')
    .regex(/^\+?\d+$/, { message: 'הטלפון חייב להכיל ספרות בלבד' })
    .max(20, 'מספר הטלפון עד 20 תווים'),
  companyName: z
    .string()
    .nonempty('נא להזין שם חברה')
    .max(120, 'שם החברה עד 120 תווים'),
  jobTitle: z.string().max(80, 'תפקיד עד 80 תווים').optional(),
  taxId: z.string().max(40, 'ח.פ. / מע״מ עד 40 תווים').optional()
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;
