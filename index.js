const program = require('commander');
const { prompt, registerPrompt } = require('inquirer');
const { startClustering } = require('./cluster');

const questions = {
    start_server: [
        {
            type: 'input',
            name: 'path',
            message: 'file path containing app module',
            validate: (input) => {
                try {
                    const mod = require(input);
                    if(mod && mod.app) {
                        return true;
                    }
                    return 'No Express App found';
                }
                catch(err) {
                    return 'No Express App found';
                }
            }
        },
        {
            type: 'input',
            name: 'no_of_processes',
            message: 'no of processes required',
            default: 1,
            validate: (input) => isNaN(input) 
                                ? 'No of processesr should be number only'
                                : input>0 
                                    ? true 
                                    : 'Min no. of processes should be 1'
        },
        {
            type: 'input',
            name: 'port',
            message: 'shared port number to use',
            default: 4000,
            validate: (input) => isNaN(input) 
                                ? 'Port number should be number only'
                                : input>999 && input<10000
                                    ? true 
                                    : 'Port number should be between 1000 to 9999'
        }
    ]
}

program
    .version('1.0.0')
    .description('Express App Manager');

program
    .command('createserver')
    .alias('cs')
    .description('Create a server to Handle the requests')
    .action(() => {
        prompt(questions.start_server).then(answers => {
            startClustering({app: require(answers.path).app, port: answers.port, no_of_processes: answers.no_of_processes});
        });
    });
    
// program
//     .command('moniter')
//     .alias('m')
//     .description('Moniter CPU and Memory uses')
//     .action(() => {
        
//     });

program.parse(process.argv);