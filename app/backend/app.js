//при регистрации успешен вход?
//

const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const favicon = require('serve-favicon');
const path = require('path');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const salt = 10;
const secretKeyToken = 'thisSecretToken';

const app = express();

//подключение к базе данных
mongoose.connect("mongodb://localhost:27017/reduxCalendar",{
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true},
    (err)=>{
        if(err){
            console.log('Не удалось подключить Базу Данных, включите базу данных и перезапустите программу!')
        }else{
            console.log("База данных подключена!")
        }});

//схема
const userCalendar = new Schema({
    login: {
        type: String,
        unique: true
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    schedule: [{
        start: {
            type: String
        },
        duration: {
            type: String
        },
        title: {
            type: String
        }
    }]
}, {versionKey: false});

const UserCalendar = mongoose.model('UserCalendar', userCalendar);

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(favicon(path.join(__dirname + '/public/images/Calendar.ico')));

//отправка файла
app.get('/', (req, res)=>{
    res.sendFile('index.html')
});

//проверка регистрации
app.post('/api/checkauth', (req, res)=>{
    jwt.verify(req.headers.authorization, secretKeyToken, function(err) {
        if (err) {
            res.status(200).json({auth: false});
        } else {
            res.status(200).json({auth: true});
        }
    });
});

//Войти
app.post('/api/login', (req, res)=>{
    let errors = validLogin(req.body);

    if(Object.keys(errors).length !== 0){
        return res.status(400).json({errors: errors, result: null})
    }

    //поиск пользователя в БД
    UserCalendar.findOne({login: req.body.login})
        .then(result=>{
            if(result === null){
                errors.login = "Не верно введен логин!";
                return res.status(400).json({errors: errors, result: null});
            }

            if(!bcrypt.compareSync(req.body.password, result.password)){
                errors.password = "Не правильный пароль!";
                return res.status(400).json({errors: errors, result: null});
            }

            //создание токена и отдача его на клиент
            const payload = {login: result.login};
            const token = jwt.sign(payload, secretKeyToken);
            res.status(200).json({errors: {}, result: true, token: token})
        })
        .catch(err=>{
            errors.errDB = true;
            console.log(err);
            return res.status(500).json({errors: errors, result: false})
        });

});

//Регистрация
app.post('/api/registration', (req, res)=>{
    let errors = validRegistration(req.body);

    if(Object.keys(errors).length !== 0){
        return res.status(400).json({errors: errors, result: false})
    }

    //запись в базу данных с подменой пароля на хеш
    const userCalendar = new UserCalendar({
        login: req.body.login,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, salt),
        schedule: []
    });

    userCalendar.save()
        .then(result=>{
            return res.status(200).json({errors: {}, result: true})
        })
        .catch(err=>{
            errors.login = "Логин не уникален!";
            if(err.code === 11000){
                console.log(errors.login);
                return res.status(400).json({errors: errors, result: false})
            }
            errors.errDB = true;
            console.log(err);
            res.status(500).json({errors: errors, result: false})
        });
});

//получить события
app.get('/api/takeevents', (req,res)=>{

    //проверка токена
    jwt.verify(req.headers.authorization, secretKeyToken, function(err, user) {
        if (err) {
            return res.status(501).json({auth: false});
        }

        //поиск событий в БД
        UserCalendar.findOne({login: user.login}, (err, result) => {
            if (err){
                res.status(404).json({result:[], auth: true});
                return console.log(err);
            }
            res.status(200).json({result:result.schedule, auth: true});
        })
    });
});

//Удалить запись
app.post('/api/deletenotation', (req, res)=>{

    //проверка токена
    jwt.verify(req.headers.authorization, secretKeyToken, function(err, user) {
        if (err) {
            return res.status(501).json({auth: false})
        }

        //удаление определенной записи из БД
        UserCalendar.findOneAndUpdate({login: user.login}, {$pull:{'schedule': {_id: req.body.id}}}, (err)=>{
            if(err) return res.status(500).json({auth: true, errors: ['Error BD!']});
            res.status(200).json({auth: true, resultDelete: true});
        });
    });


});

//Изменить запись и добавить
app.post('/api/newnotation', (req, res)=>{

    //проверка токена
    jwt.verify(req.headers.authorization, secretKeyToken, function(err, user) {
        if (err) {
            return res.status(501).json({auth: false})
        }

        let errors = [];

        //получаем все события данного пользователя
        UserCalendar.findOne({login: user.login}, (err, result)=>{
            if(err) return res.status(500).json({auth: true, errors: ['Error BD!']});
            if(result === null) return res.status(500).json({auth: true, errors: ['Error BD!']});

            //если запрос приходит с id то нам нужно заменить одно поле соответствующее id
            if(req.body.id){
                for(let i=0; result.schedule.length > i; i++){
                    if(result.schedule[i]._id + '' === req.body.id + ''){
                        result.schedule.splice(i, 1, req.body)
                    }
                }
            }else{
                //если без id то просто добавить - это новая запись
                result.schedule.push(req.body)
            }


            let newList = result.schedule;

            //сортировка событий по полю start
            function compareEvents(eventsA, eventsB) {
                return eventsA.start - eventsB.start;
            }

            newList.sort(compareEvents);

            // проверка на соответствие условий
            for(let i=0; newList.length > i; i++){
                if((+newList[i].start < 0)){
                    errors.push('События раньше 8:00 запрещены: ' + newList[i].title);
                }
                if((+newList[i].start) > 540){
                    errors.push('События позже 17:00 запрещены: ' + newList[i].title);
                    continue;
                }
                if((+newList[i].start) + (+newList[i].duration) > 540){
                    let excess = (+newList[i].start) + (+newList[i].duration) - 542;
                    newList[i].duration -= excess;
                }
                if((+newList[i].duration) <= 0){
                    errors.push('Событие не может заканчиваться еще не начавшись: ' + newList[i].title);
                }

                if(newList[i].title.trim().length === 0){
                    errors.push('Событие должно быть с названием.');
                }
                if(i > 1){
                    if((+newList[i].start) < (+newList[i-1].start) + (+newList[i-1].duration)){
                        if((+newList[i].start) < (+newList[i-2].start) + (+newList[i-2].duration)){
                            errors.push('Превышение количества событий в один период: ' + newList[i].title)
                        }
                    }
                }
            }

            if(errors.length !== 0){
                return res.status(400).json({auth: true, errors:errors, result:false});
            }

            //функция сохранения
            saveData(user.login, newList)
        })
    });

    function saveData (loginUser, data){
        UserCalendar.findOneAndUpdate({login: loginUser}, {$set:{'schedule': data}}, (err)=>{
            if(err) return res.status(500).json({auth: true, errors: ['Error BD!'], result:false});
            res.status(200).json({auth: true, result: true});
        });
    }

});

//экспортировать JSON
app.post('/api/newlist', (req, res)=>{

    //проверка токена
    jwt.verify(req.headers.authorization, secretKeyToken, function(err, user) {
        if (err) {
            return res.status(501).json({auth: false})
        }
        let errors = [];
        let newList = req.body;

        //провека на соответствие ключей
        let key = ['start', 'duration', 'title'];
        for(let i = 0; newList.length > i; i++){
            for(let y=0; key.length > y; y++){
                if(!newList[i].hasOwnProperty(key[y])){
                    errors.push('Ключи должны быть: "start", "duration", "title"');
                    break
                }
            }
        }

        if(errors.length !== 0){
            return res.status(400).json({auth: true, errors:errors, result:false});
        }

        //сортировка
        function compareEvents(eventsA, eventsB) {
            return eventsA.start - eventsB.start;
        }

        newList.sort(compareEvents);

        // проверка на соответствие условий
        for(let i=0; newList.length > i; i++){
            if((+newList[i].start < 0)){
                errors.push('События раньше 8:00 запрещены: ' + newList[i].title);
            }
            if((+newList[i].start) > 540){
                errors.push('События позже 17:00 запрещены: ' + newList[i].title);
                continue;
            }
            if((+newList[i].start) + (+newList[i].duration) > 540){
                let excess = (+newList[i].start) + (+newList[i].duration) - 542;
                newList[i].duration -= excess;
            }
            if((+newList[i].duration) <= 0){
                errors.push('Событие не может заканчиваться еще не начавшись: ' + newList[i].title);
            }

            if(newList[i].title.trim().length === 0){
                errors.push('Событие должно быть с названием.');
            }
            if(i > 1){
                if((+newList[i].start) < (+newList[i-1].start) + (+newList[i-1].duration)){
                    if((+newList[i].start) < (+newList[i-2].start) + (+newList[i-2].duration)){
                        errors.push('Превышение количества событий в один период: ' + newList[i].title)
                    }
                }
            }
        }

        //проверка на ошибки
        if(errors.length !== 0){
            return res.status(400).json({auth: true, errors:errors, result:false});
        }

        //сохранение
        UserCalendar.findOneAndUpdate({login: user.login}, {$set:{'schedule': newList}}, (err)=>{
            if(err) return res.status(500).json({auth: true, errors: ['Error BD!'], result:false});
            res.status(200).json({auth: true, result: true});
        });

    });

});

//по любому другому адресу отпралять этот файл
app.get('*', (req, res)=>{
    res.sendFile(__dirname +'/public/index.html')
});

app.listen(5000, (err)=>{
    if(err) throw err;

    console.log('Сервер запущен на порту 5000')
});

//валидация данных с полей регистрации
function validRegistration (obj){
    let errors = {};
    if(obj.login.length < 3 || obj.login.length >= 15){
        errors.login = 'Минимум 3 знака но не более 15'
    }
    if(obj.email.length <= 7){
        errors.email = 'Некорректная почта'
    }
    if(obj.password.length < 5 || obj.password.length >= 15){
        errors.password = 'Минимум 5 знаков но не более 15'
    }
    if(obj.password !== obj.confpassword){
        errors.confpassword = 'Пароли не совпадают'
    }

    return errors;
}

//валидация данных с полей логина
function validLogin (obj){
    let errors = {};
    if(obj.login.length < 3 || obj.login.length >= 15){
        errors.login = 'Минимум 3 знака но не более 15'
    }
    if(obj.password.length < 5 || obj.password.length >= 15){
        errors.password = 'Минимум 5 знаков но не более 15'
    }

    return errors;
}
