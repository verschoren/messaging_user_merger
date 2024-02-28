var client = ZAFClient.init();

//Add Smooch App ID and API Token
var sunco_app_id = '5eb9806b73e3cf000f2a8e31';
var sunco_app_token = 'dArIe2Sh0I7NlH4knDfyzMmaGXmet950LpJXlmLBC_LstxQjQXcGUVSdnwTW9JNjWSSF5hZvUc3obZrgH5_7dA';
var sunco_key_id = 'app_65a661b66b050d187d3711b8';
client.invoke('resize', { width: '100%', height: '100vh' });

$(document).ready(async function() {
    var metadata = await client.metadata();
    console.log(metadata);
    sunco_auth = btoa(sunco_key_id + ':' + sunco_app_token);
    var requester = await client.get('ticket.requester').then(function(data) {
    console.log(data);
        return data['ticket.requester'];
    });
    console.log(requester);
    $('#zendesk_user').html(JSON.stringify(requester,null, 2));
    hljs.highlightAll();

    var requester_id = requester.id;
    //get api/v2/users/identities
    var identities = await client.request({
        url: '/api/v2/users/' + requester_id + '/identities.json',
        type: 'GET',
        dataType: 'json'
    }).then(function(data) {
        return data['identities'];
    });

    //search for idenities with type messaging
    var messagingIdentities = identities.filter(function(identity) {
        return identity.type === 'messaging';
    });

    if (messagingIdentities[0]){
        $('#zendesk_identity').html(JSON.stringify(messagingIdentities[0], null, 2));
        var sunco_id = messagingIdentities[0].value;
        const options = {
            url: `https://api.smooch.io/v2/apps/${sunco_app_id}/users/${sunco_id}`,
            type: "GET",
            headers: {
              Authorization: `Basic ${sunco_auth}`,
            },
            accepts: "application/json"
          };
          
        var sunco_user = await client.request(options).then((response) => {
            return response;
        });


        console.log(sunco_user.user.profile);
        $('#sunco_user').html(JSON.stringify(sunco_user.user, null, 2));
        hljs.highlightAll();

        // search for user with sunco_user.user.profile.email
        var zendesk_user = await client.request({
            url: '/api/v2/users/search.json?query=' + sunco_user.user.profile.email,
            type: 'GET',
            dataType: 'json'
        }).then(function(data) {
            console.log(data);
            return data;
        });

        if (zendesk_user.users == 0){
            $('#existing_user').html('No user found');
            $('#create_user').attr('data-email', '');
            $('#create_user').html('Create User');
        }
        else{
            $('#existing_user').html(JSON.stringify(zendesk_user.users[0], null, 2));
            hljs.highlightAll();
            $('#create_user').attr('data-target', zendesk_user.users[0].id);
            $('#create_user').html('Merge User');
        }
    }

    $('#create_user').click(async function(){
        var zendesk_user_id = $(this).attr('data-target');
        var zendesk_user_email = $(this).attr('data-email');
        
        console.log(zendesk_user_id, zendesk_user_email);
        if (zendesk_user_id){
            //Merge requester with zendesk_user_id
            console.log('{"user": {"id": "' + zendesk_user_id + '"}}');
            var merge_result = await client.request({
                url: '/api/v2/users/' + requester_id + '/merge.json',
                type: 'PUT',
                dataType: 'json',
                data: '{"user": {"id": "' + zendesk_user_id + '"}}'
            }).then(function(data) {
                console.log(data);
                return data;
            });
        } else {
            var update_user = await client.request({
                url: '/api/v2/users/' + requester_id + '.json',
                type: 'PUT',
                dataType: 'json',
                data: '{"user": {"email": "' + zendesk_user_email + '"}}'
            }).then(function(data) {
                console.log(data);
                return data;
            });
        }
    } );
});