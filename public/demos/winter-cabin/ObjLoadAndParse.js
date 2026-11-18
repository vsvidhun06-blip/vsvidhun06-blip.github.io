class ObjLoadAndParse {
    // To load obj file
    async load(filePath) {
        const resp = await fetch(filePath);
        if (!resp.ok) {
        throw new Error(
            `ObjLoader could not find file at ${filePath}. Please check your path.`
        );
        }
        const file = await resp.text();

        if (file.length === 0) {
        throw new Error(`${filePath} File is empty.`);
        }

        return file;
    }


    async parse(file) {
        const lines = file?.split("\n");

        // Store what's in the object file here
        const cachedPositions = [];
        const cachedFaces = [];
        const cachedNormals = [];
        const cachedUvs = [];

        // Read out data from file and store into appropriate source buckets
    
        for (const untrimmedLine of lines) {
            const line = untrimmedLine.trim(); // remove whitespace
            const [startingChar, ...data] = line.split(" ");
            switch (startingChar) {
                case "v":
                    cachedPositions.push(data.map(parseFloat));
                    break;
                case "vt":
                    cachedUvs.push(data.map(parseFloat));
                    break;
                case "vn":
                    cachedNormals.push(data.map(parseFloat));
                    break;
                case "f":
                    cachedFaces.push(data);
                    break;
            }
        }

        // Use these intermediate arrays to leverage Array API (.push)
        const finalPositions = [];
        const finalNormals = [];
        const finalUvs = [];
        const finalIndices = [];

        // Loop through faces and return the buffers that will be sent to GPU for rendering 
    
        const cache = {}; // Object to track cached face strings
        let i = 0;
        for (const faces of cachedFaces) {
            for (const faceString of faces) {

                // If we've already seen this faceString, add to the indices list
                if (cache[faceString] !== undefined) {
                    finalIndices.push(cache[faceString]);
                    continue;
                }

                // Cache the faceString and add it to indices
                cache[faceString] = i;
                finalIndices.push(i);

                // Convert strings to integers and subtract by 1 to zero-index
                const [vI, uvI, nI] = faceString
                    .split("/")
                    .map((s) => Number(s) - 1);

                // Push data to respective buffers if indices are valid
                if (vI > -1) finalPositions.push(...cachedPositions[vI]);
                if (uvI > -1) finalUvs.push(...cachedUvs[uvI]);
                if (nI > -1) finalNormals.push(...cachedNormals[nI]);
                i += 1;
            }
        }
    

        // Return the buffers as Typed Arrays
        return {
            positions: new Float32Array(finalPositions),
            uvs: new Float32Array(finalUvs),
            normals: new Float32Array(finalNormals),
            indices: new Uint32Array(finalIndices),
        };
    }
}
export default ObjLoadAndParse;
