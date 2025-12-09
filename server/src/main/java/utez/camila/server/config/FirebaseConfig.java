package utez.camila.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // 1. Credenciales (JSON en Base64)
        String base64Credentials = System.getenv("FIREBASE_CREDENTIALS");

        // 2. Nombre del Bucket (NUEVO)
        String bucketName = System.getenv("FIREBASE_BUCKET");

        if (base64Credentials == null || base64Credentials.isEmpty()) {
            throw new RuntimeException("Falta la variable FIREBASE_CREDENTIALS");
        }

        if (bucketName == null || bucketName.isEmpty()) {
            throw new RuntimeException("Falta la variable FIREBASE_BUCKET");
        }

        byte[] decodedBytes = Base64.getDecoder().decode(base64Credentials);
        ByteArrayInputStream serviceAccountStream = new ByteArrayInputStream(decodedBytes);

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                .setStorageBucket(bucketName) // <--- ¡ESTA ES LA LÍNEA QUE FALTABA!
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        }
        return FirebaseApp.getInstance();
    }
}