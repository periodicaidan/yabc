/*
 * Utility functions for the whole app
 */
namespace App.Utils {
    /**
     * Loads JSON from a file
     */
    export async function loadJson(fileName: string): Promise<any> {
        return fetch(fileName, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json(), err => new Error(`Error loading ${fileName}: ${err}`))
            .catch(err => new Error(`Network error loading ${fileName}`));
    }

    /**
     * Puts the values of one object into another
     */
    export function loadValuesIntoObject(jsonData: any, targetObject: any): void {
        for (let prop in jsonData) {
            targetObject[prop] = jsonData[prop];
        }
    }
}
