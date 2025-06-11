import { createElement } from 'react';

import { msg } from '@lingui/core/macro';

// import { I18nProvider } from '@lingui/react';
import { mailer } from '@documenso/email/mailer';
import { render } from '@documenso/email/render';
import { ConfirmEmailTemplate } from '@documenso/email/templates/confirm-email';
import { prisma } from '@documenso/prisma';

import { getI18nInstance } from '../../client-only/providers/i18n-server';
import { NEXT_PUBLIC_WEBAPP_URL } from '../../constants/app';
import { env } from '../../utils/env';

// import { renderEmailWithI18N } from '../../utils/render-email-with-i18n';

export interface SendConfirmationEmailProps {
  userId: number;
}

export const sendConfirmationEmail = async ({ userId }: SendConfirmationEmailProps) => {
  const NEXT_PRIVATE_SMTP_FROM_NAME = env('NEXT_PRIVATE_SMTP_FROM_NAME');
  const NEXT_PRIVATE_SMTP_FROM_ADDRESS = env('NEXT_PRIVATE_SMTP_FROM_ADDRESS');

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
    include: {
      verificationTokens: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });
  console.log('sendConfirmationEmail to user', user.name);
  const [verificationToken] = user.verificationTokens;
  console.log('sendConfirmationEmail verificationToken', verificationToken);
  if (!verificationToken?.token) {
    console.error('Verification token not found for user', userId);
    throw new Error('Verification token not found for the user');
  }

  const assetBaseUrl = NEXT_PUBLIC_WEBAPP_URL() || 'http://localhost:3000';
  const confirmationLink = `${assetBaseUrl}/verify-email/${verificationToken.token}`;
  const senderName = NEXT_PRIVATE_SMTP_FROM_NAME || 'Documenso';
  const senderAddress = NEXT_PRIVATE_SMTP_FROM_ADDRESS || 'noreply@documenso.com';
  const i18n = await getI18nInstance();

  const confirmationTemplate = createElement(ConfirmEmailTemplate, {
    assetBaseUrl,
    confirmationLink,
  });

  console.log('sendConfirmationEmail confirmationTemplate', confirmationTemplate);

  // const [html, text] = await Promise.all([
  //   renderEmailWithI18N(confirmationTemplate),
  //   renderEmailWithI18N(confirmationTemplate, { plainText: true }),
  // ]);4

  const html = render(confirmationTemplate);
  const text = render(confirmationTemplate, { plainText: true });
  console.log('sendConfirmationEmail html', html);
  console.log('sendConfirmationEmail text', text);
  return mailer.sendMail({
    to: {
      address: user.email,
      name: user.name || '',
    },
    from: {
      name: senderName,
      address: senderAddress,
    },
    subject: i18n._(msg`Please confirm your email`),
    html,
    text,
  });
};
