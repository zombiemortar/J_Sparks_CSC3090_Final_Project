<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST["name"]);
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars($_POST["message"]);

    // Validate inputs
    if (!empty($name) && filter_var($email, FILTER_VALIDATE_EMAIL) && !empty($message)) {
        $to = "josephsparks2@me.com";
        $subject = "New Contact Form Submission from $name";
        $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";
        $headers = "From: $email\r\nReply-To: $email\r\n";

        // Send email
        if (mail($to, $subject, $body, $headers)) {
            echo "<p>Message sent successfully!</p>";
        } else {
            echo "<p>Oops! Something went wrong.</p>";
        }
    } else {
        echo "<p>Invalid input. Please check your details.</p>";
    }
} else {
    echo "<p>Access Denied</p>";
}
?>