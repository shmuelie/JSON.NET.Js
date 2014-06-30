var JsonNet
(function ()
{
    var jn = JsonNet = JsonNet || {};
    var stringify = JSON.stringify;
    var parse = JSON.parse;
    var isArray = Array.isArray || function (object)
    {
        return (typeof object === "object") && (Object.prototype.toString.call(object) === "[object Array]");
    };

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
                    if (isArray(property))
                    {
                        obj[key] = {
                            "$id": refs.length.toString(),
                            "$values": property
                        };
                    }
                    else
                    {
                        property["$id"] = refs.length.toString();
                    }
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
                    if (property["$values"])
                    {
                        refs[property["$id"]] = property["$values"];
                        obj[key] = property["$values"];
                    }
                    rebuild(refs, obj[key]);
                }
            }
        }
    }

    /**
     * Takes a object and stringifies it using JSON.NET object referencing.
     * @param {Object} obj The object to stringify.
     * @returns {String} JSON.NET compatible JSON string.
     */
    jn.stringify = function (obj)
    {
        /// <summary>
        ///     Takes a object and stringifies it using JSON.NET object referencing.
        /// </summary>
        /// <param name="obj" type="Object">
        ///     The object to stringify.
        /// </param>
        /// <returns type="String">
        ///     JSON.NET compatible JSON string.
        /// </returns>

        var references = [];
        references.push(obj);
        obj["$id"] = "0";
        ref(references, obj);
        return stringify(obj);
    };

    /**
     * Takes a JSON.NET compatible JSON string and parses it into an object.
     * @param {String} str The JSON.NET compatible JSON string.
     * @returns {Object} The parsed object.
     */
    jn.parse = function (str)
    {
        /// <summary>
        ///     Takes a JSON.NET compatible JSON string and parses it into an object.
        /// </summary>
        /// <param name="str" type="String">
        ///     The JSON.NET compatible JSON string.
        /// </param>
        /// <returns type="Object" />
        ///     The parsed object.
        /// </returns>

        var references = {};
        var obj = parse(str);
        rebuild(references, obj);
        return obj;
    };
}());