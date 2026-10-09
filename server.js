
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

const PORT = 4000;
const CHARACTERS_PATH = path.join(__dirname, 'db/characters_db.json');
const LOCATIONS_DB = path.join(__dirname, 'db/locations_db.json');

app.use(cors());
app.use(express.json());

const readData = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка чтения файла БД:', error.message);
        return [];
    }
}

const writeData = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Ошибка записи в файл БД:', error.message);
    }
}

app.get('/', (req, res) => {
    res.send('Привет! Это твой собственный бэкенд для Рика и Морти!');
})

// <------CHARACTERS----------------------->

app.get('/api/characters', async (req, res) => {
    const characters = await readData(CHARACTERS_PATH);
    res.json({ results: characters });
})

app.post('/api/characters', async (req, res) => {
    try {
        const body = req.body;
        const characters = await readData(CHARACTERS_PATH);

        const id = characters.length > 0 ? characters[characters.length - 1].id + 1 : 1;

        const newCharacter = {
            id,
            ...body,
        };

        characters.push(newCharacter);
        await writeData(CHARACTERS_PATH, characters);
        console.log('Успешно сохранен в файл db.json:', newCharacter.name);

        res.status(201).json(newCharacter);
    } catch (error) {
        res.status(501).json({ error: "Ошибка сервера при сохранении данных" });
    }


})

app.delete('/api/characters/:id', async (req, res) => {
    try {
        // Получаем id из параметров строки (req.params.id) и переводим в число
        const charId = Number(req.params.id); 
        const characters = await readData(CHARACTERS_PATH);

        // Проверяем, существует ли вообще такой персонаж
        const characterExists = characters.some(char => char.id === charId);
        if (!characterExists) {
            return res.status(404).json({ error: "Персонаж с таким ID не найден" });
        }

        // Фильтруем массив, оставляя всех, кроме удаляемого
        const updatedCharacters = characters.filter(char => char.id !== charId);
        
        // Записываем обновленные данные в файл db.json
        await writeData(CHARACTERS_PATH, updatedCharacters);
        console.log(`Персонаж с ID ${charId} успешно удален из БД`);

        // Возвращаем успешный статус и сообщение
        res.status(200).json({ message: `Персонаж с ID ${charId} успешно удален` });
    } catch (error) {
        console.error('Ошибка удаления:', error.message);
        res.status(500).json({ error: "Ошибка сервера при удалении данных" });
    }
});

// <------LOCATIONS----------------------->
app.get('/api/locations', async (req, res) => {
    const locations = await readData(LOCATIONS_DB);
    res.json({ results: locations });
})



app.listen(PORT, () => {
    console.log(`Просто швабфифти! Сервер запущен на: http://localhost:${PORT}`);
})

// console.error('Ошибка чтения файла БД:', error.message);
// console.error('Ошибка записи в файл БД:', error.message);
// 'Привет! Это твой собственный бэкенд для Рика и Морти!'
// error: "Ошибка сервера при сохранении данных"
// console.log('Успешно сохранен в файл db.json:', newCharacter.name);
// console.log(`Просто швабфифти! Сервер запущен на: http://localhost:${PORT}`)