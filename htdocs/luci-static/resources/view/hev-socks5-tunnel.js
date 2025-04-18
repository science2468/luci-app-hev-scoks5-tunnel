'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

var callServiceList = rpc.declare({
    object: 'service',
    method: 'list',
    params: ['name'],
    expect: { '': {} }
});


function getServiceStatus() {
    return L.resolveDefault(callServiceList('hev-socks5-tunnel'), {}).then(function (res) {
        var isRunning = false;
        try {
            isRunning = res['hev-socks5-tunnel']['instances']['hev-socks5-tunnel']['running'];
        } catch (e) { }
        return isRunning;
    });
}

function renderStatus(isRunning) {
    var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';
    var renderHTML;
    if (isRunning) {
        renderHTML = spanTemp.format('green', _('hev-socks5-tunnel'), _('RUNNING'));
    } else {
        renderHTML = spanTemp.format('red', _('hev-socks5-tunnel'), _('NOT RUNNING'));
    }
    return renderHTML;
}

return view.extend({
    render: function() {
        var m, s, o;    

        m = new form.Map('hev-socks5-tunnel', _('Hev Socks5 Tunnel'),
            _('Hev Socks5 Tunnel - A tunnel over Socks5 proxy.'));

        // Status section
        s = m.section(form.TypedSection);
        s.anonymous = true;
        s.render = function () {
            poll.add(function () {
                return L.resolveDefault(getServiceStatus()).then(function (res) {
                    var view = document.getElementById('service_status');
                    view.innerHTML = renderStatus(res);
                });
            });

            return E('div', { class: 'cbi-section', id: 'status_bar' }, [
                E('p', { id: 'service_status' }, _('Collecting data...'))
            ]);
            
        }
		s = m.section(form.NamedSection, 'config', 'hev-socks5-tunnel');

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;

        o = s.option(form.Value, 'socks5_server_address', _('Socks5 Server Address'));
		o.datatype = 'ipaddr';
		o.placeholder = '127.0.0.1';

		o = s.option(form.Value, 'socks5_server_port', _('Socks5 Server Port'));
		o.datatype = 'port';
		o.placeholder = '1080';

        return m.render();
    }

});