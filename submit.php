<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(array('success' => false, 'message' => 'Метод запроса не поддерживается.'));
    exit;
}

if (!empty($_POST['website'])) {
    echo json_encode(array('success' => true));
    exit;
}

function clean_text($value, $max) {
    $value = trim((string)$value);
    $value = str_replace(chr(0), '', $value);
    if (strlen($value) > $max) {
        $value = substr($value, 0, $max);
    }
    return $value;
}

$name = clean_text(isset($_POST['name']) ? $_POST['name'] : '', 200);
$phone = clean_text(isset($_POST['phone']) ? $_POST['phone'] : '', 80);
$email = trim(isset($_POST['email']) ? $_POST['email'] : '');
$assetType = clean_text(isset($_POST['asset_type']) ? $_POST['asset_type'] : '', 200);
$message = clean_text(isset($_POST['message']) ? $_POST['message'] : '', 4000);
$formType = clean_text(isset($_POST['form_type']) ? $_POST['form_type'] : 'Заявка с сайта', 200);
$consent = isset($_POST['consent']) ? (string)$_POST['consent'] : '';

if ($name === '' || $phone === '' || $consent !== '1') {
    header('HTTP/1.1 422 Unprocessable Entity');
    echo json_encode(array('success' => false, 'message' => 'Заполните ФИО и телефон и подтвердите согласие на обработку персональных данных.'));
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('HTTP/1.1 422 Unprocessable Entity');
    echo json_encode(array('success' => false, 'message' => 'Проверьте правильность E-mail.'));
    exit;
}

$email = str_replace(array("\r", "\n"), '', $email);
$to = 'viazoner@mail.ru';
$subject = 'Новая заявка с сайта - ' . $formType;
$subjectHeader = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'не определён';
$page = isset($_SERVER['HTTP_REFERER']) ? clean_text($_SERVER['HTTP_REFERER'], 500) : '';

$body = "Новая заявка с сайта lida-servis.by\n\n";
$body .= "Тип заявки: " . $formType . "\n";
$body .= "ФИО: " . $name . "\n";
$body .= "Телефон: " . $phone . "\n";
$body .= "E-mail: " . ($email !== '' ? $email : 'не указан') . "\n";
$body .= "Вид имущества: " . ($assetType !== '' ? $assetType : 'не указан') . "\n";
$body .= "Сообщение: " . ($message !== '' ? $message : 'не указано') . "\n\n";
$body .= "Согласие на обработку персональных данных: подтверждено\n";
$body .= "IP: " . $ip . "\n";
if ($page !== '') {
    $body .= "Страница отправки: " . $page . "\n";
}

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Lida-Servis <info@lida-servis.by>\r\n";
$headers .= "Reply-To: " . ($email !== '' ? $email : 'info@lida-servis.by') . "\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION;

$sent = @mail($to, $subjectHeader, $body, $headers);

if (!$sent) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(array('success' => false, 'message' => 'Сайт не смог передать письмо почтовому серверу. Проверьте настройку почты на хостинге.'));
    exit;
}

echo json_encode(array('success' => true));
?>
