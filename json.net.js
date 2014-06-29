var JsonNet
(function ()
{
    var jn = JsonNet = JsonNet || {};
    var stringify = JSON.stringify;
    var parse = JSON.parse;

    Array.prototype.indexOf = Array.prototype.indexOf || function (obj)
    {
        var length = this.length;
        for (var i = 0; i < length; i++)
        {
            var item = this[i];
            if (item === obj)
            {
                return i;
            }
        }
        return -1;
    };

    function ref(refs, obj)
    {
        /// <param name="refs" type="Array" />
        
        for (var key in obj)
        {
            if (key === "$id")
            {
                continue;
            }
            var property = obj[key];
            if (typeof property === "object")
            {
                var index = refs.indexOf(property);
                if (index === -1)
                {
                    property["$id"] = refs.length.toString();
                    refs.push(property);
                    ref(refs, property);
                }
                else
                {
                    obj[key] = {
                        "$ref": index.toString()
                    }
                }
            }
        }
    }

    function rebuild(refs, obj)
    {
        if (obj["$id"])
        {
            refs[obj["$id"]] = obj;
            delete obj["$id"];
        }
        for (var key in obj)
        {
            var property = obj[key];
            if (typeof property === "object")
            {
                if (property["$ref"])
                {
                    obj[key] = refs[property["$ref"]];
                }
                else
                {
                    rebuild(refs, property);
                }
            }
        }
    }

    jn.stringify = function (obj)
    {
        var references = [];
        references.push(obj);
        obj["$id"] = "0";
        ref(references, obj);
        return stringify(obj);
    };

    jn.parse = function (str)
    {
        var references = {};
        var obj = parse(str);
        rebuild(references, obj);
        return obj;
    };
}());