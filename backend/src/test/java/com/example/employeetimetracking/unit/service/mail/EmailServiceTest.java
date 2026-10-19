package com.example.employeetimetracking.unit.service.mail;

import com.example.employeetimetracking.service.EmailService;
import jakarta.mail.BodyPart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import jakarta.mail.Part;
import jakarta.mail.Multipart;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock JavaMailSender mailSender;

    EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(
                mailSender,
                "noreply@hrapp.local",
                "http://{slug}.localhost:4200");
    }

    @Test
    void sendInviteEmail_includesAcceptLinkAndExpiry() throws Exception {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendInviteEmail(
                "Acme",
                "acme",
                "new@acme.com",
                "raw-token",
                "2026-10-12T21:00:00");

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        MimeMessage sent = captor.getValue();
        assertEquals("You're invited to join Acme", sent.getSubject());
        String content = readBody(sent);
        System.out.println(content);
        assertTrue(content.contains("http://acme.localhost:4200/invite?token=raw-token"));
        assertTrue(content.contains("12 October 2026 at 21:00 UTC"));
        assertTrue(content.contains("Accept invitation"));
    }

    private String readBody(Part part) throws Exception {
        Object content = part.getContent();

        if (content instanceof String text) {
            return text;
        }

        if (content instanceof Multipart multipart) {
            StringBuilder body = new StringBuilder();

            for (int i = 0; i < multipart.getCount(); i++) {
                body.append(readBody(multipart.getBodyPart(i))).append("\n");
            }

            return body.toString();
        }

        return "";
    }

    @Test
    void formatExpiry_fallsBackWhenMissing() {
        assertEquals("72 hours after it was sent", EmailService.formatExpiry(null));
    }
}
