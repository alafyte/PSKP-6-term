const fs = require('fs');
let phones = require('./database.json');

class Database {
    save = () => {
        fs.writeFile(__dirname + '/database.json', JSON.stringify(phones, null, 4), err => {
            if (err) {
                console.log(err);
                throw err;
            }
        })
    }

    getAll = () => phones;

    addPhone = (lastname, phoneNumber) => {
        if (phones.find(p => p.lastname === lastname)) {
            return null;
        }

        let newPhone = { lastname: lastname, phone: phoneNumber};
        phones.push(newPhone);
        this.save();
        return newPhone;
    }

    updatePhone = (lastname, phoneNumber) => {
        let phone = phones.find(p => p.lastname === lastname);
        if (phone) {
            phone.phone = phoneNumber;
            this.save();
            return phone;
        } else return null;
    }

    deletePhone = (lastname) => {
        let phone = phones.find(p => p.lastname === lastname);

        if (phone) {
            phones = phones.filter(p => p.lastname !== lastname);
            this.save();
            return phone;
        } else return null;
    }
}

module.exports = new Database();