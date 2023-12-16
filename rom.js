// Importez le module Express
const express = require('express');
const axios=require('axios');
const redis = require('redis');

const client = redis.createClient();

client.on('error', (err) => {
    console.log(Erreur Redis : ${err});
});

const app = express();

const baseURL='https://jsonplaceholder.typicode.com/';

// Middleware de cache
const cacheMiddleware = (req, res, next) => {
    if (client.ready) {
        const key = req.originalUrl;

        client.get(key, (err, data) => {
            if (err) throw err;

            if (data !== null) {
                res.send(data);
            } else {
                res.sendResponse = res.send;
                res.send = (body) => {
                    client.setex(key, 3600, body); 
                    res.sendResponse(body);
                };
               
                next();
            }
        });
    } else {
        next();
    }
};

app.use(express.json());
app.use(express.static('static'));
app.use(cacheMiddleware);

// Proxy vers l'API distante
app.use(async (req, res) => {
    const response = await axios.get(baseURL + req.originalUrl);
    res.send(response.data);
});


// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Gestion des erreurs MongoDB
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB:'));
db.once('open', () => {
    console.log('Connecté à MongoDB');
});

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      }
});

// Schéma pour les articles avec commentaires incorporés
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// Schéma pour les commentaires
const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Middleware pour récupérer les données de l'API et les stocker dans MongoDB
app.use(async (req, res) => {
    // Utilisez axios pour récupérer les données de l'API
    const usersResponse = await axios.get(baseURL + '/users');
    const postsResponse = await axios.get(baseURL + '/posts');
    const commentsResponse = await axios.get(baseURL + '/comments');

    // Enregistrez les données dans MongoDB
    await User.insertMany(usersResponse.data);
    await Post.insertMany(postsResponse.data);
    await Comment.insertMany(commentsResponse.data);

    res.send('Données importées dans MongoDB');
});

// Écoutez le port 3000 et affichez un message lorsque le serveur démarre
const port = 3000;
app.listen(port);