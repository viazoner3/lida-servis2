<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод запроса не поддерживается.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Honeypot: real visitors leave this field empty.
if (!empty($_POST['website'] ?? '')) {
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

function clean_text(string $value, int $max = 2000): string {
    $value = trim($value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max, 'UTF-8');
}

$name = clean_text((string)($_POST['name'] ?? ''), 200);
$phone = clean_text((string)($_POST['phone'] ?? ''), 80);
$email = trim((string)($_POST['email'] ?? ''));
$assetType = clean_text((string)($_POST['asset_type'] ?? ''), 200);
$message = clean_text((string)($_POST['message'] ?? ''), 4000);
$formType = clean_text((string)($_POST['form_type'] ?? 'Заявка с сайта'), 200);
$consent = (string)($_POST['consent'] ?? '');

if ($name === '' || $phone === '' || $consent !== '1') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Заполните ФИО и телефон и подтвердите согласие на обработку персональных данных.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Проверьте правильность E-mail.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Prevent header injection even if this file is changed later to use user data in headers.
$email = str_replace(["\r", "\n"], '', $email);

$to = 'info@lida-servis.by';
$subject = 'Новая заявка с сайта — ' . $formType;
$subjectHeader = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$ip = $_SERVER['REMOTE_ADDR'] ?? 'не определён';
$page = clean_text((string)($_SERVER['HTTP_REFERER'] ?? ''), 500);

$body = "Новая заявка с сайта lida-servis.by\n\n";
$body .= "Тип заявки: {$formType}\n";
$body .= "ФИО: {$name}\n";
$body .= "Телефон: {$phone}\n";
$body .= "E-mail: " . ($email !== '' ? $email : 'не указан') . "\n";
$body .= "Вид имущества: " . ($assetType !== '' ? $assetType : 'не указан') . "\n";
$body .= "Сообщение: " . ($message !== '' ? $message : 'не указано') . "\n\n";
$body .= "Согласие на обработку персональных данных: подтверждено\n";
$body .= "IP: {$ip}\n";
if ($page !== '') {
    $body .= "Страница отправки: {$page}\n";
}

// Use a domain mailbox as the sender to reduce SPF/DMARC problems.
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Лида-Сервис <info@lida-servis.by>',
    'Reply-To: ' . ($email !== '' ? $email : 'info@lida-servis.by'),
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail($to, $subjectHeader, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Сайт не смог передать письмо почтовому серверу. Проверьте настройку почты на хостинге.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
