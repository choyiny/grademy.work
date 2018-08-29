(async function() {
    try{
        
        var fs = require('fs');
        var yaml = require('js-yaml');
        var gmw = require('./static/js/gradeMyWork.js');
        
        gmw.onUserChange(function(user){
            console.log('user:', user);
        });
        
        let prompt = require('password-prompt');
        var password = await prompt('password: ');
        var login = await gmw.signin('thierry.sans@utoronto.ca', password);
                
        // test creation
        await gmw.removeScheme('testv3');
        var rubrics = yaml.safeLoad(fs.readFileSync('./static/examples/rubrics.yaml', 'utf8'));
        var sheets = yaml.safeLoad(fs.readFileSync('./static/examples/sheets.yaml', 'utf8'));
        
        var scheme = await gmw.addScheme('testv3', rubrics, sheets);
        console.log(scheme);
        var scheme = await gmw.getScheme('testv3');
        console.log(scheme);
        var isReleased = await scheme.isReleased();
        console.log('isReleased:', isReleased);
        var rubrics = await scheme.getRubrics();
        console.log('rubrics:', JSON.stringify(rubrics, null, 2));
        var sheetIDs = await scheme.getSheetIDs();
        console.log(sheetIDs);
        
        await Promise.all(sheetIDs.map(async (sheetID) => {
            var sheet = await scheme.getSheet(sheetID);
            console.log(sheet)
            var answers = await sheet.getAnswers();
            console.log(answers);
        }));
                
        var scheme = await gmw.getScheme('testv3');
        var sheet = await scheme.getSheet('0');
        sheet.onChange(async function(answers){
            console.log('printing answers for sheet 0:', JSON.stringify(answers));
        });
        setTimeout(async function () {
            await gmw.signout();
            var login = await gmw.signin('thierry.sans@utoronto.ca', password);
            sheet.setAnswer('0','0', 25);
        }, 5000)
        setTimeout(function () {
            sheet.setAnswer('0','0', 20);
        }, 7000)
    }catch (err){
        console.error(err);
    }finally{
        gmw.close();
        setTimeout(function () {
            process.exit(0);
        }, 8000)
        
    }      
}())