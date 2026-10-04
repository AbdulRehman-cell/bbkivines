const mongoose = require('mongoose');

// Define schemas locally to ensure self-contained robustness in seed file
const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Topic slug is required'],
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: [true, 'Topic ID is required'],
      trim: true,
      index: true
    },
    prompt: {
      type: String,
      required: [true, 'Question prompt is required'],
      trim: true
    },
    options: {
      type: [String],
      required: [true, 'Options are required']
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Index of the correct answer (0-based) is required']
    },
    difficulty: {
      type: String,
      default: 'Medium'
    }
  },
  { timestamps: true }
);

const leaderboardSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      default: 0
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
      min: [0, 'Time taken cannot be negative']
    },
    accuracy: {
      type: Number,
      default: 100
    },
    topicId: {
      type: String,
      required: [true, 'Topic ID is required']
    }
  },
  { timestamps: true }
);

// Register Models
const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Leaderboard = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brainsnap';

async function seed() {
  console.log('Connecting to database:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Database connected successfully.');

  // 1. Seed Topics
  const topicCount = await Topic.countDocuments();
  let scienceTopicId, historyTopicId, popCultureTopicId;

  if (topicCount === 0) {
    console.log('Seeding topics...');
    const insertedTopics = await Topic.insertMany([
      {
        name: 'Science & Cosmos',
        slug: 'science',
        description: 'Quantum particles, cosmic constants, and genetic codes. Fuel your inner scientist under immense time-dilation.',
        active: true
      },
      {
        name: 'Chronicles & History',
        slug: 'history',
        description: 'Empires rise and fall in seconds. Trace historical trajectories and critical geopolitical flashpoints.',
        active: true
      },
      {
        name: 'Arcade Pop Culture',
        slug: 'pop-culture',
        description: 'Pixelated nostalgia, legendary synth soundtracks, movie blockbusters, and rapid gaming lore.',
        active: true
      }
    ]);
    console.log(`Inserted ${insertedTopics.length} topics.`);
    scienceTopicId = insertedTopics[0]._id.toString();
    historyTopicId = insertedTopics[1]._id.toString();
    popCultureTopicId = insertedTopics[2]._id.toString();
  } else {
    console.log('Topics already exist in the database.');
    const science = await Topic.findOne({ slug: 'science' });
    const history = await Topic.findOne({ slug: 'history' });
    const pop = await Topic.findOne({ slug: 'pop-culture' });
    scienceTopicId = science ? science._id.toString() : null;
    historyTopicId = history ? history._id.toString() : null;
    popCultureTopicId = pop ? pop._id.toString() : null;
  }

  // 2. Seed Questions (at least 10 high-quality trivia questions per active topic for realistic gameplay loops)
  const questionCount = await Question.countDocuments();
  if (questionCount === 0) {
    console.log('Seeding high-velocity question database nodes...');
    const questionsList = [];

    // Science questions (10)
    if (scienceTopicId) {
      questionsList.push(
        {
          topicId: scienceTopicId,
          prompt: 'Which elementary particle acts as the quantum medium for the electromagnetic force?',
          options: ['Gluon', 'Photon', 'Higgs Boson', 'Z Boson'],
          correctAnswer: 1,
          difficulty: 'Hard'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What is the speed of light in a vacuum to the nearest million meters per second?',
          options: ['150 million m/s', '299 million m/s', '450 million m/s', '300,000 m/s'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What is the most abundant gas in Earth\'s atmosphere?',
          options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'],
          correctAnswer: 2,
          difficulty: 'Easy'
        },
        {
          topicId: scienceTopicId,
          prompt: 'Which cellular organelle possesses its own DNA separate from the nucleus?',
          options: ['Ribosome', 'Golgi Apparatus', 'Lysosome', 'Mitochondria'],
          correctAnswer: 3,
          difficulty: 'Medium'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What temperature is absolute zero on the Celsius scale?',
          options: ['-273.15 °C', '-100 °C', '0 °C', '-459.67 °C'],
          correctAnswer: 0,
          difficulty: 'Hard'
        },
        {
          topicId: scienceTopicId,
          prompt: 'Which physical law states that entropy of an isolated system always increases over time?',
          options: ['First Law of Thermodynamics', 'Second Law of Thermodynamics', 'Newton\'s Third Law', 'Hubble\'s Law'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What element has the atomic number 1 on the periodic table?',
          options: ['Helium', 'Hydrogen', 'Lithium', 'Oxygen'],
          correctAnswer: 1,
          difficulty: 'Easy'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What force keeps planets in orbit around stars?',
          options: ['Electromagnetism', 'Strong Nuclear Force', 'Gravity', 'Centrifugal Force'],
          correctAnswer: 2,
          difficulty: 'Easy'
        },
        {
          topicId: scienceTopicId,
          prompt: 'Which planet in our solar system boasts the highest number of discovered moons?',
          options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
          correctAnswer: 1,
          difficulty: 'Hard'
        },
        {
          topicId: scienceTopicId,
          prompt: 'What is the primary chemical element that makes up diamonds?',
          options: ['Silicon', 'Carbon', 'Nitrogen', 'Coal'],
          correctAnswer: 1,
          difficulty: 'Easy'
        }
      );
    }

    // History questions (10)
    if (historyTopicId) {
      questionsList.push(
        {
          topicId: historyTopicId,
          prompt: 'Which Roman general was famously assassinated on the Ides of March in 44 BC?',
          options: ['Mark Antony', 'Augustus', 'Julius Caesar', 'Pompey the Great'],
          correctAnswer: 2,
          difficulty: 'Easy'
        },
        {
          topicId: historyTopicId,
          prompt: 'In which century did the Black Death first sweep catastrophically across Europe?',
          options: ['12th Century', '13th Century', '14th Century', '15th Century'],
          correctAnswer: 2,
          difficulty: 'Medium'
        },
        {
          topicId: historyTopicId,
          prompt: 'Who was the first Emperor of the unified Chinese Empire, initiating the Qin dynasty?',
          options: ['Qin Shi Huang', 'Han Wudi', 'Kublai Khan', 'Sun Yat-sen'],
          correctAnswer: 0,
          difficulty: 'Hard'
        },
        {
          topicId: historyTopicId,
          prompt: 'In what year did the Berlin Wall fall, leading to the reunification of Germany?',
          options: ['1985', '1989', '1991', '1993'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: historyTopicId,
          prompt: 'Which empire was ruled by Suleiman the Magnificent during its golden age?',
          options: ['Byzantine Empire', 'Ottoman Empire', 'Persian Empire', 'Holy Roman Empire'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: historyTopicId,
          prompt: 'Who wrote the legendary "95 Theses" in 1517, sparking the Protestant Reformation?',
          options: ['John Calvin', 'Henry VIII', 'Martin Luther', 'Erasmus'],
          correctAnswer: 2,
          difficulty: 'Easy'
        },
        {
          topicId: historyTopicId,
          prompt: 'The Battle of Waterloo in 1815 saw the final military defeat of which commander?',
          options: ['Duke of Wellington', 'Napoleon Bonaparte', 'Tsar Alexander I', 'Horatio Nelson'],
          correctAnswer: 1,
          difficulty: 'Easy'
        },
        {
          topicId: historyTopicId,
          prompt: 'Which ancient civilization built the towering step-pyramid city of Chichen Itza?',
          options: ['Incas', 'Aztecs', 'Mayans', 'Olmecs'],
          correctAnswer: 2,
          difficulty: 'Medium'
        },
        {
          topicId: historyTopicId,
          prompt: 'What code of laws is famous for the retributive principle of "an eye for an eye"?',
          options: ['Justinian Code', 'Magna Carta', 'Code of Hammurabi', 'Twelve Tables'],
          correctAnswer: 2,
          difficulty: 'Easy'
        },
        {
          topicId: historyTopicId,
          prompt: 'Which historic ship transport transported the Pilgrims to North America in 1620?',
          options: ['The Santa Maria', 'The Mayflower', 'The Discovery', 'The Endeavour'],
          correctAnswer: 1,
          difficulty: 'Easy'
        }
      );
    }

    // Pop Culture questions (10)
    if (popCultureTopicId) {
      questionsList.push(
        {
          topicId: popCultureTopicId,
          prompt: 'What year did the original Arcade classic Pac-Man debut in North America?',
          options: ['1978', '1980', '1982', '1985'],
          correctAnswer: 1,
          difficulty: 'Hard'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'Which fictional space planet was Luke Skywalker raised on in the Star Wars universe?',
          options: ['Tatooine', 'Alderaan', 'Hoth', 'Dagobah'],
          correctAnswer: 0,
          difficulty: 'Easy'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'What is the name of the synthetic, glowing energy container in the classic Tron movie?',
          options: ['Identity Disc', 'The Grid', 'Recognizer', 'Solar Sailer'],
          correctAnswer: 0,
          difficulty: 'Hard'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'Which legendary rock band released the dark, synthetic album "The Dark Side of the Moon"?',
          options: ['Led Zeppelin', 'Pink Floyd', 'The Who', 'Queen'],
          correctAnswer: 1,
          difficulty: 'Easy'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'In the game Minecraft, what specific block is required to activate a Portal to the Nether?',
          options: ['Bedrock', 'Obsidian', 'Glowstone', 'Crying Obsidian'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'Who directed the futuristic cyberpunk cinematic masterpiece "Blade Runner" in 1982?',
          options: ['James Cameron', 'Steven Spielberg', 'Ridley Scott', 'George Lucas'],
          correctAnswer: 2,
          difficulty: 'Medium'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'What is the highest-selling home video game console of all time?',
          options: ['Nintendo Switch', 'PlayStation 2', 'PlayStation 4', 'Nintendo Wii'],
          correctAnswer: 1,
          difficulty: 'Medium'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'Which virtual cyber world serves as the primary setting of the sci-fi novel Ready Player One?',
          options: ['The Grid', 'OASIS', 'The Matrix', 'Metropolis'],
          correctAnswer: 1,
          difficulty: 'Easy'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'What brand of cybernetic sunglasses or futuristic visor does Geordi La Forge wear in Star Trek?',
          options: ['C-Visor', 'VISOR', 'Spectra-6', 'Ocular Link'],
          correctAnswer: 1,
          difficulty: 'Hard'
        },
        {
          topicId: popCultureTopicId,
          prompt: 'Which music icon released the legendary album and short-film project "Thriller" in 1982?',
          options: ['Prince', 'Michael Jackson', 'David Bowie', 'Madonna'],
          correctAnswer: 1,
          difficulty: 'Easy'
        }
      );
    }

    if (questionsList.length > 0) {
      const insertedQuestions = await Question.insertMany(questionsList);
      console.log(`Successfully hardcoded ${insertedQuestions.length} rapid-fire questions into the database.`);
    }
  } else {
    console.log('Questions already exist in the database.');
  }

  // 3. Seed Leaderboard entries
  const leaderboardCount = await Leaderboard.countDocuments();
  if (leaderboardCount === 0) {
    console.log('Seeding competitive retro leaderboard...');
    if (scienceTopicId && historyTopicId && popCultureTopicId) {
      await Leaderboard.insertMany([
        {
          username: 'NEURAL_RAIDER_01',
          score: 950,
          timeTaken: 42,
          accuracy: 100,
          topicId: scienceTopicId
        },
        {
          username: 'CYBER_SAGE_99',
          score: 890,
          timeTaken: 56,
          accuracy: 90,
          topicId: scienceTopicId
        },
        {
          username: 'GRID_RUNNER_X',
          score: 910,
          timeTaken: 38,
          accuracy: 90,
          topicId: popCultureTopicId
        },
        {
          username: 'CHRONO_CRUSADER',
          score: 850,
          timeTaken: 65,
          accuracy: 80,
          topicId: historyTopicId
        },
        {
          username: 'SYNAPSE_BLAZE',
          score: 720,
          timeTaken: 78,
          accuracy: 70,
          topicId: popCultureTopicId
        }
      ]);
      console.log('Leaderboard scores initialized.');
    }
  } else {
    console.log('Leaderboard is already populated.');
  }

  console.log('Database seeding process completed successfully!');
  await mongoose.disconnect();
  console.log('Disconnected from database.');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});