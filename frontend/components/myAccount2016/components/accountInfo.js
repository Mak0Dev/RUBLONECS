import React, { useRef, useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import getFlag from "../../../lib/getFlag";
import { setUserDescription } from "../../../services/accountInformation";
import { getTheme, setTheme, getCustomTheme, setCustomTheme, defaultCustomTheme } from "../../../services/theme";
import { get2020Menu, set2020Menu } from "../../../services/develop";
import AuthenticationStore from "../../../stores/authentication";
import useCardStyles from "../../userProfile/styles/card";
import MyAccountStore from "../stores/myAccountStore"
import useFormStyles from "../styles/forms";
import GenderSelection from "./genderSelection";
import Subtitle from "./subtitle";

const useEditButtonStyles = createUseStyles({
  editButton: {
    float: 'right',
    color: '#666',
    cursor: 'pointer',
  },
})

const EditButton = (props) => {
  const s = useEditButtonStyles();
  return <span className={s.editButton} onClick={props.onClick}>Edit</span>
}

const AccountInfo = props => {
  const store = MyAccountStore.useContainer();
  const auth = AuthenticationStore.useContainer();
  const descRef = useRef(null);
  const [is2020MenuEnabled, set2020MenuEnabled] = useState(false);
  const [customTheme, setCustomThemeState] = useState(getCustomTheme());
  const [isLoading, setIsLoading] = useState(false);

  const cardStyles = useCardStyles();
  const s = useFormStyles();
   
  useEffect(() => {
	const load2020Menu = async () => {
		try {
		  const menuSetting = await get2020Menu();
		  set2020MenuEnabled(menuSetting.enabled);
		} catch (error) {
		  console.error("Failed to get 2020 menu setting:", error);
		}
	  };
	  load2020Menu();
	  }, []);

  const handle2020MenuChange = async (enabled) => {
	setIsLoading(true);
	  try {
		await set2020Menu({ enabled });
		set2020MenuEnabled(enabled);
		window.location.reload();
	  } catch (error) {
		console.error("Failed to set 2020 menu setting:", error);
	  } finally {
		setIsLoading(false);
	  }
	};
	
	
  return <div className='row settings-container'>
    <div className='col-12 mt-2'>
      <Subtitle>Account Info</Subtitle>
      <div className={cardStyles.card + ' p-3'}>
        <p className={s.accountInfoLabel}>Username: <span className={s.accountInfoValue}>{auth.username}</span> <EditButton onClick={() => {
          store.setModal('CHANGE_USERNAME');
        }}></EditButton></p>
        <p className={s.accountInfoLabel}>Password: <span className={s.accountInfoValue}>**********</span> <EditButton onClick={() => {
          store.setModal('CHANGE_PASSWORD');
        }}></EditButton></p>
        <p className={s.accountInfoLabel}>Email Address: <span className={s.accountInfoValue}>{store.email}</span> <EditButton onClick={() => {
          store.setModal('CHANGE_EMAIL');
        }}></EditButton></p>
      </div>
    </div>
    <div className='col-12 mt-2'>
      <Subtitle>Personal</Subtitle>
      <div className={cardStyles.card + ' p-3'}>
        <textarea ref={descRef} className={s.descInput} rows={3} defaultValue={store.description}></textarea>
        <p className='mb-0 font-size-12'>Do not provide any details that can be used to identify you outside ROBLOX.</p>
        <div className='mt-1'>
          <div className='row'>
            <div className='col pe-0'>
              <input className={'form-control ' + s.select + ' ' + s.disabled} value='Birthday' readOnly={true} type='text'></input>
            </div>
            <div className='col ps-0 pe-0'>
              <select className={'form-control ' + s.select}>
                <option value='1'>January</option>
                <option value='2'>February</option>
                <option value='3'>March</option>
                <option value='4'>April</option>
                <option value='5'>May</option>
                <option value='6'>June</option>
                <option value='7'>July</option>
                <option value='8'>August</option>
                <option value='9'>September</option>
                <option value='10'>October</option>
                <option value='11'>November</option>
                <option value='12'>December</option>
              </select>
            </div>
            <div className='col ps-0 pe-0'>
              <select className={'form-control ' + s.select}>
                {[... new Array(31)].map((v, i) => {
                  return <option value={i + 1} key={i}>{i + 1}</option>
                })}
              </select>
            </div>
            <div className='col ps-0'>
              <select className={'form-control ' + s.select}>
                {[... new Array(100)].map((v, i) => {
                  return <option value={2016 - i} key={i}>{2016 - i}</option>
                })}
              </select>
            </div>
          </div>
        </div>
        <div className='mt-2'>
          <div className='row'>
            <div className='col pe-0'>
              <input className={'form-control ' + s.select + ' ' + s.disabled} value='Gender' readOnly={true} type='text'></input>
            </div>
            <GenderSelection id={2} displayName='Male'></GenderSelection>
            <GenderSelection id={3} displayName='Female'></GenderSelection>
          </div>
        </div>
        <div className='mt-1 mb-4'>
          <div className={s.saveButtonWrapper}>
            <button className={s.saveButton} onClick={() => {
              // todo: gender, birthdate
              setUserDescription({
                newDescription: descRef.current.value,
              });
            }}>Save</button>
          </div>
        </div>
        <div className='mt-4 mb-4'>&emsp;</div>
      </div>
    </div>
  {getFlag("settingsPageThemeSelectorEnabled", false) && (
      <div className="col-12 mt-2">
        <Subtitle>Extensions</Subtitle>
        <div className={cardStyles.card + " p-3"}>
          <div className="row mt-1">
            <div className="col pe-0">
              <input className={"form-control " + s.select + " " + s.disabled} value="Website Theme" readOnly type="text" />
            </div>
            <div className="col ps-0 pe-0">
              <select className={"form-control " + s.select} value={getTheme()} onChange={(ev) => { setTheme(ev.currentTarget.value); setCustomThemeState(getCustomTheme()); window.location.reload(); }}>
                <option value="light">Default</option>
                <option value="obc2016">OBC Theme</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {getTheme() === "custom" && (
            <div className="mt-3 p-3 custom-theme-editor" style={{ border: "1px solid #c3c3c3", background: "var(--custom-surface, #fafafa)" }}>
              <p className="mb-2"><strong>Custom Theme</strong></p>
              <p className="font-size-12 mb-3">Настрой здесь практически все основные цвета сайта. Настройки сохраняются в этом браузере.</p>

              {[
                ["background", "Background"], ["surface", "Cards / panels"], ["primary", "Main color"], ["secondary", "Secondary color"],
                ["text", "Text"], ["link", "Links"], ["backgroundImage", "Page background image"],
                ["sidebarBackground", "Sidebar background"], ["sidebarText", "Sidebar text"], ["sidebarIconColor", "Sidebar icons"], ["sidebarDivider", "Sidebar divider"],
                ["sidebarCountBackground", "Sidebar notification"], ["sidebarCountText", "Sidebar notification text"],
                ["searchBackground", "Search background"], ["searchText", "Search text"], ["searchBorder", "Search border"], ["searchIconColor", "Search icon"], ["searchSuggestionBackground", "Search suggestions"], ["searchSuggestionText", "Search suggestion text"], ["searchSuggestionHover", "Search suggestion hover"],
                ["chatBackground", "Chat background"], ["chatText", "Chat text"], ["chatHeaderBackground", "Chat header"], ["chatHeaderText", "Chat header text"], ["chatMessageSelfBackground", "My message background"], ["chatMessageSelfText", "My message text"], ["chatMessageOtherBackground", "Other message background"], ["chatMessageOtherText", "Other message text"], ["chatBackgroundImage", "Chat background image"],
                ["upgradeBackground", "Upgrade Now background"], ["upgradeText", "Upgrade Now text"], ["upgradeHoverBackground", "Upgrade Now hover"],
                ["footerBackground", "Footer background"], ["footerText", "Footer text"], ["footerLink", "Footer links"], ["footerHover", "Footer link hover"],
                ["navbarText", "Navbar text"], ["currencyIconColor", "Robux / Tickets icons"], ["settingsIconColor", "Settings icon"], ["menuIconColor", "Menu icon"], ["globalIconColor", "Other icons"],
                ["containerBackground", "All content containers"], ["containerText", "Container text"], ["containerBorder", "Container border"],
                ["catalogContainerBackground", "Catalog container"], ["catalogContainerText", "Catalog container text"], ["catalogContainerBorder", "Catalog container border"],
                ["avatarContainerBackground", "Avatar container"], ["avatarContainerText", "Avatar container text"], ["avatarContainerBorder", "Avatar container border"],
                ["settingsContainerBackground", "Settings container"], ["settingsContainerText", "Settings container text"], ["settingsContainerBorder", "Settings container border"],
                ["pageTitleColor", "Page titles"], ["buttonBackground", "Buttons"], ["buttonText", "Button text"], ["buttonHoverBackground", "Button hover"],
                ["inputBackground", "Input background"], ["inputText", "Input text"], ["inputBorder", "Input border"]
              ].map(([key, label]) => (
                <div className="row g-2 mb-2" key={key}>
                  <div className="col-7"><label className="font-size-12 mb-0">{label}</label></div>
                  <div className="col-5">
                    {key.toLowerCase().includes('image') ? (
                      <input className="form-control form-control-sm" value={customTheme[key] || ''} placeholder="URL или загрузите файл ниже" onChange={(ev) => { const value = ev.currentTarget.value; const next = { ...customTheme, [key]: value }; setCustomThemeState(next); setCustomTheme({ [key]: value }); }} />
                    ) : (
                      <input type="color" value={customTheme[key] || '#ffffff'} onChange={(ev) => { const value = ev.currentTarget.value; const next = { ...customTheme, [key]: value }; setCustomThemeState(next); setCustomTheme({ [key]: value }); }} style={{ width: "44px", height: "30px", padding: "1px", cursor: "pointer" }} />
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-3 p-2" style={{ borderTop: "1px solid var(--custom-secondary, #ccc)" }}>
                <label className="font-size-12 d-block mb-1">Upload page background image</label>
                <input className="form-control" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(ev) => {
                  const file = ev.currentTarget.files && ev.currentTarget.files[0]; if (!file) return; const reader = new FileReader();
                  reader.onload = () => { const backgroundImage = String(reader.result); const next = { ...customTheme, backgroundImage }; setCustomThemeState(next); setCustomTheme({ backgroundImage }); };
                  reader.readAsDataURL(file);
                }} />
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Page background fit</label>
                <select className="form-control form-control-sm" value={customTheme.backgroundImageSize || 'cover'} onChange={(ev) => { const backgroundImageSize = ev.currentTarget.value; const next = { ...customTheme, backgroundImageSize }; setCustomThemeState(next); setCustomTheme({ backgroundImageSize }); }}>
                  <option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Original size</option>
                </select>
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Page background repeat</label>
                <select className="form-control form-control-sm" value={customTheme.backgroundImageRepeat || 'no-repeat'} onChange={(ev) => { const backgroundImageRepeat = ev.currentTarget.value; const next = { ...customTheme, backgroundImageRepeat }; setCustomThemeState(next); setCustomTheme({ backgroundImageRepeat }); }}>
                  <option value="no-repeat">No repeat</option><option value="repeat">Repeat</option><option value="repeat-x">Repeat X</option><option value="repeat-y">Repeat Y</option>
                </select>
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Page background position</label>
                <select className="form-control form-control-sm" value={customTheme.backgroundImagePosition || 'center'} onChange={(ev) => { const backgroundImagePosition = ev.currentTarget.value; const next = { ...customTheme, backgroundImagePosition }; setCustomThemeState(next); setCustomTheme({ backgroundImagePosition }); }}>
                  <option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
                </select>
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Upload chat background image</label>
                <input className="form-control" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={(ev) => {
                  const file = ev.currentTarget.files && ev.currentTarget.files[0]; if (!file) return; const reader = new FileReader();
                  reader.onload = () => { const chatBackgroundImage = String(reader.result); const next = { ...customTheme, chatBackgroundImage }; setCustomThemeState(next); setCustomTheme({ chatBackgroundImage }); };
                  reader.readAsDataURL(file);
                }} />
              </div>

              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Chat background fit</label>
                <select className="form-control form-control-sm" value={customTheme.chatBackgroundImageSize || 'cover'} onChange={(ev) => { const chatBackgroundImageSize = ev.currentTarget.value; const next = { ...customTheme, chatBackgroundImageSize }; setCustomThemeState(next); setCustomTheme({ chatBackgroundImageSize }); }}>
                  <option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Original size</option>
                </select>
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Chat background repeat</label>
                <select className="form-control form-control-sm" value={customTheme.chatBackgroundImageRepeat || 'no-repeat'} onChange={(ev) => { const chatBackgroundImageRepeat = ev.currentTarget.value; const next = { ...customTheme, chatBackgroundImageRepeat }; setCustomThemeState(next); setCustomTheme({ chatBackgroundImageRepeat }); }}>
                  <option value="no-repeat">No repeat</option><option value="repeat">Repeat</option><option value="repeat-x">Repeat X</option><option value="repeat-y">Repeat Y</option>
                </select>
              </div>
              <div className="mt-2 p-2">
                <label className="font-size-12 d-block mb-1">Chat background position</label>
                <select className="form-control form-control-sm" value={customTheme.chatBackgroundImagePosition || 'center'} onChange={(ev) => { const chatBackgroundImagePosition = ev.currentTarget.value; const next = { ...customTheme, chatBackgroundImagePosition }; setCustomThemeState(next); setCustomTheme({ chatBackgroundImagePosition }); }}>
                  <option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option>
                </select>
              </div>
              <div className="mt-3">
                <label className="font-size-12 d-block mb-1">Logo URL</label>
                <input className="form-control" value={customTheme.logo} placeholder="/img/rb_logo.png or https://..." onChange={(ev) => { const logo = ev.currentTarget.value; const next = { ...customTheme, logo }; setCustomThemeState(next); setCustomTheme({ logo }); }} />
              </div>
              <div className="mt-2">
                <label className="font-size-12 d-block mb-1">Upload logo</label>
                <input className="form-control" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" onChange={(ev) => {
                  const file = ev.currentTarget.files && ev.currentTarget.files[0]; if (!file) return; const reader = new FileReader();
                  reader.onload = () => { const logo = String(reader.result); const next = { ...customTheme, logo }; setCustomThemeState(next); setCustomTheme({ logo }); };
                  reader.readAsDataURL(file);
                }} />
              </div>

              <div className="mt-3 d-flex gap-2 flex-wrap">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                  const blob = new Blob([JSON.stringify(customTheme, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'karblox-custom-theme.json'; a.click(); URL.revokeObjectURL(url);
                }}>Download theme JSON</button>
                <label className="btn btn-secondary btn-sm mb-0" style={{ cursor: 'pointer' }}>Load theme JSON
                  <input type="file" accept="application/json,.json" hidden onChange={(ev) => {
                    const file = ev.currentTarget.files && ev.currentTarget.files[0]; if (!file) return; const reader = new FileReader();
                    reader.onload = () => { try { const imported = JSON.parse(String(reader.result)); if (!imported || typeof imported !== 'object' || Array.isArray(imported)) throw new Error('bad format'); const next = { ...getCustomTheme(), ...imported }; setCustomThemeState(next); setCustomTheme(next); } catch (e) { alert('Invalid theme JSON'); } };
                    reader.readAsText(file);
                  }} />
                </label>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => { setCustomThemeState({ ...defaultCustomTheme }); setCustomTheme({ ...defaultCustomTheme }); }}>Reset custom theme</button>
              </div>
            </div>
          )}

          <div className="row mt-3">
            <div className="col pe-0">
              <input className={"form-control " + s.select + " " + s.disabled} value="2020+ Beta Menu" readOnly type="text" />
            </div>
            <div className="col ps-0 pe-0">
              <select className={"form-control " + s.select} value={is2020MenuEnabled ? "enabled" : "disabled"} onChange={(ev) => handle2020MenuChange(ev.currentTarget.value === "enabled")} disabled={isLoading}>
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
  )}
  </div>;
};

export default AccountInfo;