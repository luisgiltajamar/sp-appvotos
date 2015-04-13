﻿'use strict';



var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var opiniones;
var lista,listaV;

function init() {
    lista = context.get_web().get_lists().getByTitle("Opiniones");
    listaV = context.get_web().get_lists().getByTitle("Votos");

}

function crearOpinion() {

    var ici = SP.ListItemCreationInformation();
    var item = lista.addItem(ici);
    item.set_item("Subject", $("#txtAsunto").val());
    item.set_item("Opinion", $("#txtOpinion").val());

    item.update();
    context.load(item);
    context.executeQueryAsync(function() {
        alert("Opinion creada con exito");
            listadoOpiniones();
        },
        function(sender,args) {

            alert(args.get_message());
        }
    );

}

function listadoVotos() {
    var votos = lista.getItems(new SP.CamlQuery());

    context.load(votos);
    context.executeQueryAsync(function () {
        var html = "<ul>";

        var enumeracion = votos.getEnumerator();
        while (enumeracion.moveNext()) {
            var item = enumeracion.get_current();
            html += "<li>" +
                item.get_item("Positivo") +"-->"+
               
                "</li>";
        }
        html += "</ul>";
        $("#listado").html(html);

    }, function (sender, args) {
        alert(args.get_message());

    });


}


function listadoOpiniones() {

    opiniones = lista.getItems(new SP.CamlQuery());
  
    context.load(opiniones);
    context.executeQueryAsync(function() {
        var html = "<ul>";

        var enumeracion = opiniones.getEnumerator();
        while (enumeracion.moveNext()) {
            var item = enumeracion.get_current();
            html += "<li><a href='#' onclick='cargar(" + item.get_item("ID") + ")'>" +
                item.get_item("Subject") +
                "</a></li>";
        }
        html += "</ul>";
        $("#listado").html(html);

    },function (sender, args) {
                alert(args.get_message());

    });


}

function cargar(id) {
   
    var enumeracion = opiniones.getEnumerator();
    while (enumeracion.moveNext()) {
        var item = enumeracion.get_current();
        if (item.get_item("ID") == id) {

            $("#Asunto").html(item.get_item("Subject"));
            $("#texto").html(item.get_item("Opinion"));
            $("#votar").html("<a href='#' onclick='votar(" + id + ")'>Me gusta</a>");
            ContarVotos(id);
            break;
        }
    }

}

function votar(id) {
    var url = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getByTitle('Votos')/items";
    var digest = $("#__REQUESTDIGEST").val();
    var obj = {
       BuscadorOpinionId:id,
        Positivo: true

    };
    var objtxt = JSON.stringify(obj);

    $.ajax(
        {
            url: url,
            data: objtxt,
            type: 'POST',
            headers: {
                'accept': 'application/json;odata=verbose',
                'content-type': 'application/json',
                'X-RequestDigest':digest

            },
            success: function() {
                alert("Gracias por el voto");
                cargar(id);

            },
            error: function(err) {

                alert(JSON.stringify(err));

            }

        }
    );


}

function ContarVotos(id) {
    var votos = 0;

    var url = _spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getByTitle('Votos')/items";
    $.ajax({
        url: url + "?$filter=BuscadorOpinionId eq " + id,
        type: "GET",
        headers: { "accept": "application/json;odata=verbose" },
        success: function(res) {
            $.each(res.d.results, function(i, result) {
                if (result.Positivo)
                    votos++;
               
            });
            $("#votos").html(votos);
        },
        error: function(err) {
            alert(JSON.stringify(err));
        }
    });

}

$(document).ready(function() {

    $("#btnAddOpinion").click(function() {
        crearOpinion();

    });
    init();
    //


    listadoOpiniones();
    //listadoVotos();
});




