
const { connect, disconnect } = require('mongoose');
var log4js = require("log4js");

const dotenv = require('dotenv');

const { currentWarriorsMatchModel } = require("../src/Model/CurrentWarriorsMatchModel");
const { freeBBModel } = require("../src/Model/FreeBBModel");

dotenv.config({ path: './../.env'});


const connectDB = async () => {
  try {
    console.log(`Database connecting to ${process.env.NODE_ENV} environment.`);
    const production = process.env.NODE_ENV === 'production';
    const options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    
    await connect(
      production ? process.env.MONGODB_PROD_URI : process.env.MONGODB_DEV_URI,
      options,
    );
    console.log('MongoDB connected!');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
    try {
        await disconnect();
    } catch(error) {
        console.error(error.message);
        process.exit(1);
    }
}
const getMatchDetail = async () => {
    await connectDB();
    const matches = await currentWarriorsMatchModel.find({live: true}).sort({updatedAt: -1}).limit(1);
    var logger = log4js.getLogger();
    logger.level = "all";
    if(matches.length == 0)
        logger.warn("no live game data");
    else {
        logger = log4js.getLogger('Game Id');
        logger.info(matches[0]['game_id'])
        logger = log4js.getLogger('Opposite team');
        logger.info(matches[0]['opposite_team'])
        logger = log4js.getLogger('3 point score');
        logger.info(matches[0]['tpm'])
    }
    await disconnectDB();
}

const setTpm = async () => {
    // Connect to db
    await connectDB();

    var logger = log4js.getLogger();
    logger.level = "all";

    const matches = await currentWarriorsMatchModel.find({live: true}).sort({updatedAt: -1}).limit(1);

    if(matches.length == 0) {
        logger.warn("no live game data");
    } else {
        try {
            for(let i = 0; i < 3 ; i ++) {
                await freeBBModel.create({
                    'game_id': matches[0]['game_id'],
                    'wallet': '0x'
                })
            }
            matches[0]['tpm'] += 1;
            await matches[0].save();
            logger.info("SUCCESS");
        } catch (err) {
            logger.error(err);
        }
    }
    
    // Close DB connection
    await disconnectDB();
}
const main = () => {
    const args = process.argv;
    if(args[2] == "info")
        getMatchDetail();
    else if(args[2] == "update")
        setTpm();
}


main()