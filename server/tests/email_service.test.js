import { sendForgotPasswordEmail } from '../app/services/email.service';
import * as constants from '../app/utils/constants.utils';
import nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      response: 'Email sent successfully',
    }),
  }),
}));

describe('sendForgotPasswordEmail function', () => {
  it('should send a forgot password email successfully', async () => {
    const email = 'test@example.com';
    const url = 'https://example.com/reset-password';
    const resetPasswordToken = 'fake-reset-token';

    const result = await sendForgotPasswordEmail(
      email,
      url,
      resetPasswordToken
    );

    expect(result).toEqual(constants.EMAIL_SENT_SUCCESS);
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      text: null,
      html: expect.any(String),
    });
  });
});
