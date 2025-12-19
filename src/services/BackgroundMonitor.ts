import BackgroundService from 'react-native-background-actions';
import { audioMonitor } from './AudioMonitor';
import { Platform } from 'react-native';

const sleep = (time: number) => new Promise((resolve) => setTimeout(() => resolve(true), time));

class BackgroundMonitor {

    // The task that runs in background
    private async backgroundTask(taskDataArguments?: any) {
        const { delay } = taskDataArguments || { delay: 1000 };

        // Use a promise that never resolves until stop is called or loop ends
        await new Promise<void>(async (resolve) => {
            console.log("Background Task Started");
            const started = await audioMonitor.start();

            if (!started) {
                console.log("Audio Monitor failed to start in BG");
            }

            // Loop to keep service alive
            while (BackgroundService.isRunning()) {
                // AudioMonitor is event driven, we just sleep to keep the JS thread responsive/alive
                await sleep(delay);
            }

            // Cleanup when loop breaks (service stopped)
            audioMonitor.stop();
            console.log("Background Task Stopped");
            resolve();
        });
    }

    async start() {
        const options = {
            taskName: 'Suraksha',
            taskTitle: 'Suraksha Active',
            taskDesc: 'Monitoring environment for safety',
            taskIcon: {
                name: 'ic_launcher',
                type: 'mipmap',
            },
            color: '#ff00ff',
            parameters: {
                delay: 2000,
            },
        };

        if (!BackgroundService.isRunning()) {
            await BackgroundService.start(this.backgroundTask, options);
            console.log("Background Service Started");
        }
    }

    async stop() {
        if (BackgroundService.isRunning()) {
            await BackgroundService.stop();
            console.log("Background Service Stopped");
        }
    }

    isRunning() {
        return BackgroundService.isRunning();
    }
}

export const backgroundMonitor = new BackgroundMonitor();
