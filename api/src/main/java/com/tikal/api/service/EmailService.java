package com.tikal.api.service;

import lombok.extern.slf4j.Slf4j;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendPasswordResetOtp(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Código de recuperación de contraseña - Tikal");

            ClassPathResource logo = new ClassPathResource("images/logo-tikal.png");

            String baseLink = "http://localhost:5173";
            String recoverLink = baseLink + "/forgot-password?email=" + toEmail;
            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #63A47D; border-radius: 10px; background-color: #f1f8f3;">
                        <div href="%4$s" style="text-align: center; margin-bottom: 20px;">
                            <a href="%4$s">
                                <img src="cid:logoImage" alt="Tikal Logo" style="max-width: 150px; height: auto;">
                            </a>
                        </div>
                        <h2 style="color: #454545; text-align: center;">Recuperación de Contraseña</h2>
                        <p style="color: #454545; font-size: 16px;">Hola,</p>
                        <p style="color: #454545; font-size: 16px;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Tikal</strong>. Introduce el siguiente código en la aplicación:</p>
            
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; color: #f1f8f3; background-color: #63A47D; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">
                                %1$s
                            </span>
                        </div>
            
                        <p style="color: #7f8c8d; font-size: 14px; text-align: center;">Este código caducará en <strong>8 minutos</strong>.</p>
            
                        <hr style="border: none; border-top: 1px solid #63A47D; margin: 30px 0;">
            
                        <div style="text-align: center;">
                            <p style="color: #454545; font-size: 14px;">¿No has sido tú? Puedes ignorar este correo de forma segura.</p>
                            <p style="color: #454545; font-size: 14px;">
                                Contacto: <a href="mailto:%2$s" style="color: #63A47D; text-decoration: none;">%2$s</a>
                            </p>
                            <a href="%3$s" style="color: #63A47D; text-decoration: none; font-weight: bold;">Ir a recuperar contraseña</a>
                        </div>
                    </div>
                    """.formatted(otpCode, fromEmail, recoverLink, baseLink);

            helper.setText(htmlContent, true);
            helper.addInline("logoImage", logo);

            mailSender.send(message);

        } catch (MessagingException e) {
            log.error("Error al enviar el correo HTML: " + e.getMessage());
        }
    }
}