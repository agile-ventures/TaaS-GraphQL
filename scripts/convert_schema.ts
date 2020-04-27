import fs from 'fs';

(async function () {
    var schemaText = fs.readFileSync(`src/schema/schema.graphql`, 'utf8');
    var cmnt = false;
    var indent = '';
    for (var l of schemaText.split(/\r?\n/)) {
        if (l.endsWith('"""')) {
            cmnt = !cmnt;
            indent = l.substring(0, l.length - 3);
        } else {
            if (cmnt) {
                process.stdout.write(indent);
                process.stdout.write('# ');
                process.stdout.write(l.trim());
            } else {
                process.stdout.write(l);
            }
            process.stdout.write('\n');
        }
    }
})();
