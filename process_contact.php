<?php
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration
$recaptcha_secret = 'YOUR_RECAPTCHA_SECRET_KEY';
$admin_email = 'your-email@example.com'; // Replace with your email

// Validate CSRF token
session_start();
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid CSRF token']);
    exit;
}

// Validate reCAPTCHA
if (!isset($_POST['g-recaptcha-response'])) {
    http_response_code(400);
    echo json_encode(['error' => 'reCAPTCHA verification failed']);
    exit;
}

$recaptcha_response = file_get_contents(
    'https://www.google.com/recaptcha/api/siteverify',
    false,
    stream_context_create([
        'http' => [
            'method' => 'POST',
            'content' => http_build_query([
                'secret' => $recaptcha_secret,
                'response' => $_POST['g-recaptcha-response']
            ])
        ]
    ])
);

$recaptcha_result = json_decode($recaptcha_response);
if (!$recaptcha_result->success) {
    http_response_code(400);
    echo json_encode(['error' => 'reCAPTCHA verification failed']);
    exit;
}

// Validate required fields
$required_fields = ['name', 'email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit;
    }
}

// Sanitize and validate input
$name = filter_var(trim($_POST['name']), FILTER_SANITIZE_STRING);
$email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
$subject = filter_var(trim($_POST['subject']), FILTER_SANITIZE_STRING);
$message = filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING);
$phone = isset($_POST['phone']) ? filter_var(trim($_POST['phone']), FILTER_SANITIZE_STRING) : 'Not provided';

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Prepare email content
$email_subject = "Contact Form Submission: $subject";
$email_body = "You have received a new contact form submission:\n\n" .
    "Name: $name\n" .
    "Email: $email\n" .
    "Phone: $phone\n" .
    "Subject: $subject\n\n" .
    "Message:\n$message\n";

$headers = "From: $email\r\n" .
    "Reply-To: $email\r\n" .
    "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($admin_email, $email_subject, $email_body, $headers)) {
    // Log the submission (optional)
    error_log("New contact form submission from $email", 0);
    
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
?>