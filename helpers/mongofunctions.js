const {User}=require('../models/user');
const {Game}=require('../models/game');
const {Admin}=require('../models/admin');
const {AdminControls}=require('../models/admincontrols');
const {History}=require('../models/history');

module.exports = {
    insert: async function (collectionName, document) {
      try {
        var tr = eval(collectionName);
        const collection = await tr.create(document);
        console.log("Inserted a document");
        return collection;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findOne: async function (query, collectionName) {
      try {
        var tr = eval(collectionName);
        const document = await tr.findOne(query);
        //console.log("Found a document");
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findSort: async function (query, collectionName, sortOptions, limitValue) {
      try {
        var tr = eval(collectionName);
        const document = await tr.findOne(query).sort(sortOptions).limit(limitValue);
        //console.log("Found a document");
        return document;
      
    
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
     findOneDocument: async function (query, collectionName) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find(query);
        //console.log("Found a document");
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    
  
    find: async function (collectionName) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find();
        //console.log("Found a document");
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findselect: async function (collectionName, queryCondition) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find(queryCondition);
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findfilters: async function (collectionName, filter = {}) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find(filter);
        //console.log("Found documents");
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findfilter: async function (collectionName, filter, fieldsToSelect) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find(filter, fieldsToSelect);
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  
    findlimit: async function (collectionName, limit) {
      try {
        var tr = eval(collectionName);
        const documents = await tr.find().limit(limit); 
        return documents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  
    findSelect: async function (collectionName, fieldsToExclude) {
      try {
        var tr = eval(collectionName);
        const document = await tr.find({}, fieldsToExclude);
        return document;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findOneAndUpdate: async function (query, update, collectionName, options) {
      try {
        var tr = eval(collectionName);
        const collection = await tr.findOneAndUpdate(query, update, options);
        console.log("Updated a document");
        return collection;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    updateMany: async function (query,update, collectionName, options) {
      try {
        var tr = eval(collectionName);
        const collection = await tr.updateMany(query,update, options);
        console.log("Updated multiple documents");
        return collection;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    findOneAndDelete: async function (query, collectionName) {
      try {
        var tr = eval(collectionName);
        const collection = await tr.findOneAndDelete(query);
        //console.log("Deleted a document");
        return collection;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    Delete: async function (collectionName) {
      try {
        var tr = eval(collectionName);
        const collection = await tr.deleteMany();
        //console.log("Deleted a document");
        return collection;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    aggregate:async function(collectionName,query){
      try{
        var tr=eval(collectionName);
        const collection=await tr.aggregate(query);
        return collection;
       }catch(error){
        console.error(error);
        throw error;
      }
    },
    findLatest: async function (collectionName, sortQuery, limitValue) {
      try {
        var tr = eval(collectionName);
        const documents = await tr.find().sort(sortQuery).limit(limitValue);
      return documents;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
   countDocuments:async function (collectionName) {
    try {
      var tr = eval(collectionName);
      const document = await tr.find();
      //console.log("Found a document");
      return document;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
    
  };
  