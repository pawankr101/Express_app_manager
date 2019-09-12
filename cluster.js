const cluster = require('cluster');
const { cpus, EOL} = require('os');
const { createServer } = require('http');

function handleMasterProcess(numberOfProcesses=1, app, port=3000) {
    if(numberOfProcesses>1) {
        for (let index = 0; index < numberOfProcesses; index++) {
            cluster.fork();
        }
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died.${EOL} Code: ${code},${EOL} Signal: ${signal}${EOL}`);
            cluster.fork();
        });
    } else {
        startServer(app, port, process.pid);
    }
}

function startServer(app, port=3000, process_id=0) {
    return createServer(app).listen(port, () => {
        let server_msg = `Server is running...${EOL} Port: ${port},${EOL}`;
        server_msg += process_id ? ` Process id: ${process_id}${EOL}` : ``;
        console.log(server_msg);
    });
}

function handleWorkerProcess(app, port=3000) {
    const server = startServer(app, port, process.pid);
    server.on('error', error => {
        let err_msg = (error.code == 'EADDRINUSE')
            ? `Port No.: ${port} is already occupied.`
            : error.message;
        err_msg += `${EOL}Server stopped.${EOL}`;
        console.log(err_msg);
        server.close();
        process.kill(process.pid, 'SIGHUP');
    });
}

function startClustering({app, port=3000, no_of_processes=1}) {
    if(cluster.isMaster) {
        handleMasterProcess(no_of_processes, app, port);
    } else if (cluster.isWorker) {
        handleWorkerProcess(app, port);
    } else {
        console.log('Some different process is running');
    }
}

module.exports = {
    startClustering: startClustering
}