const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


router.get('/', contactController.getAllContacts);
router.get('/add', contactController.addContactForm);
router.get('/edit/:id', contactController.editContactForm);

router.post('/add', contactController.addContact);
router.post('/edit/:id', contactController.editContact);
router.post('/delete/:id', contactController.deleteContact);

module.exports = router;
