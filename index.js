const express = require('express');

const app = express();
const port = 1000;

let users = [];

app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {

    let html = `
    <html>
    <head>
        <title>Market</title>

        <link rel="apple-touch-icon" sizes="180x180" href="favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicons/favicon-16x16.png">
        <link rel="manifest" href="favicons/site.webmanifest">
        <link rel="mask-icon" href="favicons/safari-pinned-tab.svg" color="#faebd6">
        <meta name="msapplication-TileColor" content="#faebd6">
        <meta name="theme-color" content="#faebd6">

        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    </head>
    <body>
        <form action="/" method="POST">
            <input type="text" name="name" placeholder="Ім'я" required />
            <input type="text" name="login" placeholder="Логін" required />
            <input type="password" name="password" placeholder="Пароль" required />
            <button type="submit">Зареєструватися</button>
        </form>

    </body>
    </html>
    `
  res.send(html);
});

app.post('/', (req, res) => {
    const { name, login, password } = req.body;
    users.push({ name, login });

    let userList = '<h2>Список користувачів:</h2><ul>';

    userList += "<ul>";
    for (let i = 0; i < users.length; i++) {
        userList += `<li>Ім'я: ${users[i].name}, Логін: ${users[i].login}</li>`;
    }
    userList += "</ul>";

  res.send(userList);
});

app.listen(port, () => {
  console.log(`Сервер запущено на http://localhost:${port}`);
});
