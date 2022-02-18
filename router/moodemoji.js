const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./../modal/user')
const LocalDiary = require('./../modal/localdiary')

app.post('/findAll',async (req,res)=>{
    const {token,period} = req.body
    var moodList = [
        {'emoji': '😄', 'mood': 'Happy'},
        {'emoji': '😭', 'mood': 'Sadly'},
        {'emoji': '😑', 'mood': 'Boring'},
        {'emoji': '😪', 'mood': 'Tired'},
        {'emoji': '😎', 'mood': 'Cool'},
        {'emoji': '😜', 'mood': 'Nonsense'},
        {'emoji': '😞', 'mood': 'Disappointed'},
        {'emoji': '😌', 'mood': 'Relax'},
        {'emoji': '😤', 'mood': 'Angry'},
        {'emoji': '😡', 'mood': 'Furious'},
        {'emoji': '😵', 'mood': 'Confused'},
        {'emoji': '😳', 'mood': 'Shy'},
        {'emoji': '🥰', 'mood': 'Lovely'},
        {'emoji': '😒', 'mood': 'Annoyed'},
        {'emoji': '☺', 'mood': ' Thankful'},
      ];
    try {
        var result_mood = {}
        var id = jwt.verify(token,'password'); 
        const user = await User.findOne({_id : id.id});
        var dateNow = new Date(Date.now() + 7 * (60 * 60 * 1000) );
        var dateMin = new Date(Date.now() + 7 * (60 * 60 * 1000) );
        dateMin.setDate(dateMin.getDate()-period)
        const allDiary = await LocalDiary.find({$and:[{user_id:user.id,date:{$lt:dateNow}},{user_id:user.id,date:{$gt:dateMin}}]})
        for(i=0;i < allDiary.length;i++){
            var con = allDiary[i]['mood_emoji']+ ' '+ allDiary[i]['mood_detail']
            if(!(con in result_mood)){
                result_mood[con] = 1
            }else{
                result_mood[con] += 1
            }
        }
        const sortable = Object.entries(result_mood)
        .sort(([,a],[,b]) => b-a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
        console.log(sortable)
        var emo = []
        if(Object.keys(sortable).length > 7){
            var c = 0;
            for(const g in sortable){
                if(c > 4){
                    emo.push(g)
                }
                c++
            }
            for( i in emo){
                delete sortable[emo[i]]
            }
            res.json(sortable) 
        }else if(Object.keys(sortable).length < 7){
            for(i = 0;i < moodList.length;i++){
                if(Object.keys(sortable).length == 7){
                    break;
                }else{
                    if(!(moodList[i]['emoji']+' '+ moodList[i]['mood'] in sortable)){
                        sortable[moodList[i]['emoji']+' '+ moodList[i]['mood']] = 0
                    }
                }
            }
            res.json(sortable)
        }else{
            res.json(sortable)
        }
        
         
        
    } catch (e) {
        console.log(e)
        res.json({'message':'error'})
    }
})

module.exports = app