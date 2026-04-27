package com.user_management.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class CounselorOnboardingEmailService {

	private final JavaMailSender mailSender;
	private final String fromAddress;

	public CounselorOnboardingEmailService(JavaMailSender mailSender,
										   @Value("${spring.mail.username:}") String fromAddress) {
		this.mailSender = mailSender;
		this.fromAddress = fromAddress;
	}

	public void sendOnboardingEmail(String recipientEmail, String counselorName, String temporaryPassword) {
		SimpleMailMessage message = new SimpleMailMessage();
		if (fromAddress != null && !fromAddress.isBlank()) {
			message.setFrom(fromAddress);
		}
		message.setTo(recipientEmail);
		message.setSubject("Your Counselor Account Has Been Created");
		message.setText(buildMessageBody(counselorName, recipientEmail, temporaryPassword));

		mailSender.send(message);
	}

	private String buildMessageBody(String counselorName, String recipientEmail, String temporaryPassword) {
		return String.format(
				"Hello %s,%n%n" +
				"Your counselor account has been created for %s.%n" +
				"Use the following temporary password to sign in for the first time:%n%n" +
				"Email: %s%n" +
				"Temporary Password: %s%n%n" +
				"Please log in and change your password immediately after signing in.%n%n" +
				"Regards,%n" +
				"User Management Team,%n" +
				"Skill Bridge Lanka",
				counselorName,
				recipientEmail,
				recipientEmail,
				temporaryPassword
		);
	}
}
