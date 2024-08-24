const { hash, compare } = require("bcryptjs");
const sqliteConnection = require('../database/sqlite');
const AppError = require("../utils/AppError");
const knex = require("../database/knex");

class UsersController {

    
    async create(req,res) {
        const { name, email, password } = req.body;

        const database = await sqliteConnection();

        const hasehedPassword = await hash(password, 10);

        const checkIfUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(checkIfUserExists) {
            throw new AppError("Já existe um usuário com esse email");
        }

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hasehedPassword]);

        return res.status(201).json();
    }

    async update(req,res) {
        const { name, email, password, old_password } = req.body;
        const  { id }  = req.params;
        
        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

        if(!user) {
           throw new AppError("Usuário não encontrado");
        }

        const userWithEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(userWithEmail && userWithEmail.id !== user.id) {
            throw new AppError("Já existe um usuário com esse email");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(password && !old_password){
            throw new AppError("A senha é Obrigatória");
        }

        if( password && old_password ){

            const checkOldPassword = await compare(old_password, user.password);

            console.log(checkOldPassword);

            if(!checkOldPassword) {
                throw new AppError("A senha não confere.");
            }

            user.password = await hash(password, 10);
            
        }

        await database.run(`UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME('now') WHERE id = (?)`, [user.name, user.email, user.password, id]);

        return res.json({ message: "Usuário Alterado com sucesso!"});

    }

    async delete(req,res) {
        const { id } = req.params;

        const database = await sqliteConnection();

        await knex("users").where({ id }).delete();

        return res.json();
    }
}

module.exports = UsersController;